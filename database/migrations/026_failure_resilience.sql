-- ============================================================
-- MIGRATION 026: Failure Resilience
-- Dead letter queue, retry mechanisms, alerting
-- ============================================================

-- 1. Failure logs table (dead letter queue)
CREATE TABLE IF NOT EXISTS public.failure_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  operation VARCHAR(100) NOT NULL,
  error_message TEXT,
  error_detail JSONB,
  severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('debug', 'warning', 'error', 'critical')),
  status VARCHAR(20) DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'retrying', 'resolved', 'ignored')),
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  last_retry_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failure_logs_status ON public.failure_logs(status);
CREATE INDEX IF NOT EXISTS idx_failure_logs_entity ON public.failure_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_failure_logs_created ON public.failure_logs(created_at DESC);

ALTER TABLE public.failure_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'failure_logs' AND policyname = 'Admin view failure logs') THEN
    CREATE POLICY "Admin view failure logs" ON public.failure_logs
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'super_admin', 'Manager'))
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'failure_logs' AND policyname = 'System insert failure logs') THEN
    CREATE POLICY "System insert failure logs" ON public.failure_logs
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 2. Retry queue table
CREATE TABLE IF NOT EXISTS public.retry_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  failure_log_id UUID REFERENCES public.failure_logs(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  operation VARCHAR(100) NOT NULL,
  payload JSONB,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  max_retries INT DEFAULT 3,
  attempts INT DEFAULT 0,
  last_error TEXT,
  acquired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retry_queue_scheduled ON public.retry_queue(scheduled_at) WHERE acquired_at IS NULL;

-- 3. Log failure RPC
CREATE OR REPLACE FUNCTION public.log_failure(
  p_entity_type VARCHAR,
  p_entity_id UUID DEFAULT NULL,
  p_operation VARCHAR DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_error_detail JSONB DEFAULT NULL,
  p_severity VARCHAR DEFAULT 'error',
  p_max_retries INT DEFAULT 3
)
RETURNS UUID AS $$
DECLARE
  v_failure_id UUID;
BEGIN
  INSERT INTO public.failure_logs (entity_type, entity_id, operation, error_message, error_detail, severity, max_retries)
  VALUES (p_entity_type, p_entity_id, p_operation, p_error_message, p_error_detail, p_severity, p_max_retries)
  RETURNING id INTO v_failure_id;

  -- Auto-enqueue for retry if retries remain
  IF p_max_retries > 0 THEN
    INSERT INTO public.retry_queue (failure_log_id, entity_type, entity_id, operation, payload, max_retries)
    VALUES (v_failure_id, p_entity_type, p_entity_id, p_operation, p_error_detail, p_max_retries);
  END IF;

  -- Alert on critical failures
  IF p_severity = 'critical' THEN
    INSERT INTO public.notification_logs (user_id, channel, title, message, type, entity_type, entity_id)
    SELECT p.id, 'in_app', 'Critical Failure: ' || p_operation,
      p_entity_type || ' (' || COALESCE(p_entity_id::text, 'N/A') || '): ' || LEFT(p_error_message, 200),
      'error', p_entity_type, p_entity_id
    FROM public.profiles p
    WHERE p.role IN ('Admin', 'super_admin', 'Manager');
  END IF;

  RETURN v_failure_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Retry RPC
CREATE OR REPLACE FUNCTION public.retry_operation(p_retry_queue_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_record RECORD;
BEGIN
  SELECT * INTO v_record FROM public.retry_queue WHERE id = p_retry_queue_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Retry record not found');
  END IF;

  UPDATE public.retry_queue SET attempts = attempts + 1, acquired_at = NOW(), last_error = NULL
  WHERE id = p_retry_queue_id;

  -- Mark failure as retrying
  UPDATE public.failure_logs SET status = 'retrying', last_retry_at = NOW()
  WHERE id = v_record.failure_log_id;

  RETURN jsonb_build_object('success', true, 'entity_type', v_record.entity_type, 'entity_id', v_record.entity_id, 'operation', v_record.operation);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Resolve failure RPC
CREATE OR REPLACE FUNCTION public.resolve_failure(
  p_failure_id UUID,
  p_resolution_note TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
  UPDATE public.failure_logs
  SET status = 'resolved', resolved_at = NOW(), resolution_note = p_resolution_note
  WHERE id = p_failure_id;

  -- Clean up pending retries
  UPDATE public.retry_queue SET acquired_at = NOW()
  WHERE failure_log_id = p_failure_id AND acquired_at IS NULL;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Get failure summary RPC
CREATE OR REPLACE FUNCTION public.get_failure_summary()
RETURNS TABLE(
  entity_type VARCHAR, severity VARCHAR, status VARCHAR,
  count BIGINT, oldest TIMESTAMPTZ, latest TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT f.entity_type, f.severity, f.status,
    COUNT(*)::BIGINT,
    MIN(f.created_at), MAX(f.created_at)
  FROM public.failure_logs f
  GROUP BY f.entity_type, f.severity, f.status
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. Auto cleanup: resolve failures after 30 days
CREATE OR REPLACE FUNCTION public.auto_expire_failures()
RETURNS VOID AS $$
BEGIN
  UPDATE public.failure_logs
  SET status = 'resolved', resolved_at = NOW(), resolution_note = 'Auto-expired after 30 days'
  WHERE created_at < NOW() - INTERVAL '30 days' AND status IN ('unresolved', 'retrying');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enable realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'failure_logs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.failure_logs;
  END IF;
END $$;
