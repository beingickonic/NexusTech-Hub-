-- ============================================================
-- MIGRATION 025: Reports & Dashboard Analytics
-- KPI views, trend functions, performance aggregations
-- ============================================================

-- 1. Revenue KPI: total revenue, avg order value, pending revenue
CREATE OR REPLACE FUNCTION public.get_revenue_kpis(p_from_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days', p_to_date TIMESTAMPTZ DEFAULT NOW())
RETURNS JSONB AS $$
DECLARE
  v_total_revenue NUMERIC;
  v_avg_order_value NUMERIC;
  v_pending_revenue NUMERIC;
  v_order_count INT;
BEGIN
  SELECT COALESCE(SUM(total_amount), 0), COUNT(*)
  INTO v_total_revenue, v_order_count
  FROM public.orders
  WHERE status IN ('Completed', 'Delivered', 'Paid', 'Finance Approved')
    AND created_at BETWEEN p_from_date AND p_to_date;

  SELECT COALESCE(SUM(total_amount), 0)
  INTO v_pending_revenue
  FROM public.orders
  WHERE status IN ('Pending', 'Pending Finance Approval', 'Reserved', 'Ready for Dispatch')
    AND created_at BETWEEN p_from_date AND p_to_date;

  v_avg_order_value := CASE WHEN v_order_count > 0 THEN v_total_revenue / v_order_count ELSE 0 END;

  RETURN jsonb_build_object(
    'total_revenue', v_total_revenue,
    'avg_order_value', ROUND(v_avg_order_value, 2),
    'pending_revenue', v_pending_revenue,
    'order_count', v_order_count
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Order trends by day
CREATE OR REPLACE FUNCTION public.get_order_trends(
  p_days INT DEFAULT 30,
  p_interval VARCHAR DEFAULT 'day'
)
RETURNS TABLE(period TEXT, revenue NUMERIC, orders BIGINT, avg_value NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(date_trunc(p_interval::regclass, created_at), 'YYYY-MM-DD') AS period,
    COALESCE(SUM(total_amount), 0) AS revenue,
    COUNT(*)::BIGINT AS orders,
    ROUND(COALESCE(AVG(total_amount), 0), 2) AS avg_value
  FROM public.orders
  WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND status NOT IN ('Cancelled', 'Refunded')
  GROUP BY date_trunc(p_interval::regclass, created_at)
  ORDER BY period;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. Delivery performance: avg time, on-time rate, driver stats
CREATE OR REPLACE FUNCTION public.get_delivery_performance(
  p_from_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_to_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_total_deliveries INT;
  v_on_time INT;
  v_avg_delivery_minutes NUMERIC;
  v_failed INT;
BEGIN
  SELECT COUNT(*) INTO v_total_deliveries
  FROM public.dispatches
  WHERE status = 'delivered'
    AND updated_at BETWEEN p_from_date AND p_to_date;

  SELECT COUNT(*) INTO v_on_time
  FROM public.dispatches
  WHERE status = 'delivered'
    AND updated_at BETWEEN p_from_date AND p_to_date
    AND (EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) <= 120; -- within 2 hours

  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60), 0)
  INTO v_avg_delivery_minutes
  FROM public.dispatches
  WHERE status = 'delivered'
    AND updated_at BETWEEN p_from_date AND p_to_date;

  SELECT COUNT(*) INTO v_failed
  FROM public.delivery_events
  WHERE event_type IN ('failed', 'rejected')
    AND created_at BETWEEN p_from_date AND p_to_date;

  RETURN jsonb_build_object(
    'total_deliveries', v_total_deliveries,
    'on_time', v_on_time,
    'on_time_rate', CASE WHEN v_total_deliveries > 0 THEN ROUND(100.0 * v_on_time / v_total_deliveries, 1) ELSE 0 END,
    'avg_delivery_minutes', ROUND(v_avg_delivery_minutes, 1),
    'failed', v_failed
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. Inventory turnover: low stock, total products, value
CREATE OR REPLACE FUNCTION public.get_inventory_summary()
RETURNS JSONB AS $$
DECLARE
  v_total_products INT;
  v_low_stock INT;
  v_out_of_stock INT;
  v_total_value NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total_products FROM public.products WHERE archived = FALSE;

  SELECT COUNT(*) INTO v_low_stock
  FROM public.inventory i
  JOIN public.products p ON p.id = i.product_id
  WHERE p.archived = FALSE AND i.quantity_on_hand < COALESCE(i.reorder_level, 10);

  SELECT COUNT(*) INTO v_out_of_stock
  FROM public.inventory i
  JOIN public.products p ON p.id = i.product_id
  WHERE p.archived = FALSE AND i.quantity_on_hand <= 0;

  SELECT COALESCE(SUM(i.quantity_on_hand * COALESCE(p.price, 0)), 0)
  INTO v_total_value
  FROM public.inventory i
  JOIN public.products p ON p.id = i.product_id
  WHERE p.archived = FALSE;

  RETURN jsonb_build_object(
    'total_products', v_total_products,
    'low_stock', v_low_stock,
    'out_of_stock', v_out_of_stock,
    'total_inventory_value', v_total_value,
    'stock_health_pct', CASE WHEN v_total_products > 0 THEN ROUND(100.0 * (v_total_products - v_low_stock - v_out_of_stock) / v_total_products, 1) ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. Supplier performance: on-time delivery rate, PO count
CREATE OR REPLACE FUNCTION public.get_supplier_performance(p_supplier_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_total_pos INT;
  v_completed_pos INT;
  v_on_time_deliveries INT;
  v_total_deliveries INT;
BEGIN
  SELECT COUNT(*) INTO v_total_pos FROM public.purchase_orders
    WHERE (p_supplier_id IS NULL OR supplier_id = p_supplier_id);

  SELECT COUNT(*) INTO v_completed_pos FROM public.purchase_orders
    WHERE status = 'received'
    AND (p_supplier_id IS NULL OR supplier_id = p_supplier_id);

  SELECT COUNT(*) INTO v_total_deliveries FROM public.supplier_deliveries
    WHERE (p_supplier_id IS NULL OR supplier_id = p_supplier_id);

  SELECT COUNT(*) INTO v_on_time_deliveries FROM public.supplier_deliveries
    WHERE status = 'completed'
    AND (p_supplier_id IS NULL OR supplier_id = p_supplier_id);

  RETURN jsonb_build_object(
    'total_purchase_orders', v_total_pos,
    'completed_purchase_orders', v_completed_pos,
    'completion_rate', CASE WHEN v_total_pos > 0 THEN ROUND(100.0 * v_completed_pos / v_total_pos, 1) ELSE 0 END,
    'total_deliveries', v_total_deliveries,
    'on_time_deliveries', v_on_time_deliveries
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. Finance KPI: approved vs rejected rate, pending count
CREATE OR REPLACE FUNCTION public.get_finance_kpis()
RETURNS JSONB AS $$
DECLARE
  v_pending_approvals INT;
  v_approved_count INT;
  v_rejected_count INT;
  v_total_processed INT;
BEGIN
  SELECT COUNT(*) INTO v_pending_approvals
  FROM public.orders WHERE status = 'Pending Finance Approval';

  SELECT COUNT(*) INTO v_approved_count
  FROM public.finance_approvals WHERE action = 'approved';

  SELECT COUNT(*) INTO v_rejected_count
  FROM public.finance_approvals WHERE action = 'rejected';

  v_total_processed := v_approved_count + v_rejected_count;

  RETURN jsonb_build_object(
    'pending_approvals', v_pending_approvals,
    'approved', v_approved_count,
    'rejected', v_rejected_count,
    'approval_rate', CASE WHEN v_total_processed > 0 THEN ROUND(100.0 * v_approved_count / v_total_processed, 1) ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. Order status distribution for pie charts
CREATE OR REPLACE FUNCTION public.get_order_status_distribution()
RETURNS TABLE(status VARCHAR, count BIGINT, total_amount NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT o.status, COUNT(*)::BIGINT, COALESCE(SUM(o.total_amount), 0)
  FROM public.orders o
  GROUP BY o.status
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 8. Top products by revenue
CREATE OR REPLACE FUNCTION public.get_top_products(p_limit INT DEFAULT 10)
RETURNS TABLE(product_id UUID, title VARCHAR, units_sold BIGINT, revenue NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT oi.product_id, MAX(p.title) AS title,
    SUM(oi.quantity)::BIGINT AS units_sold,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS revenue
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  JOIN public.products p ON p.id = oi.product_id
  WHERE o.status IN ('Completed', 'Delivered')
  GROUP BY oi.product_id
  ORDER BY revenue DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 9. Customer loyalty stats
CREATE OR REPLACE FUNCTION public.get_customer_stats()
RETURNS JSONB AS $$
DECLARE
  v_total_customers INT;
  v_avg_rating NUMERIC;
  v_avg_loyalty_points NUMERIC;
  v_total_feedback INT;
BEGIN
  SELECT COUNT(*) INTO v_total_customers FROM public.profiles WHERE role = 'Customer';

  SELECT COALESCE(AVG(rating), 0) INTO v_avg_rating
  FROM public.customer_delivery_confirms WHERE rating IS NOT NULL;

  SELECT COALESCE(AVG(loyalty_points), 0) INTO v_avg_loyalty_points
  FROM public.profiles WHERE role = 'Customer';

  SELECT COUNT(*) INTO v_total_feedback
  FROM public.customer_delivery_confirms WHERE feedback IS NOT NULL AND feedback != '';

  RETURN jsonb_build_object(
    'total_customers', v_total_customers,
    'average_rating', ROUND(v_avg_rating, 2),
    'average_loyalty_points', ROUND(v_avg_loyalty_points, 1),
    'total_feedback', v_total_feedback
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
