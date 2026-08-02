import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle, XCircle, RefreshCw, Ban } from 'lucide-react';
import {
  ORDER_STAGES,
  getJourneyIndex,
  getProgress,
  getNextStage,
  getNextAction,
  buildStageLog,
  formatJourneyDate,
  formatJourneyTime,
  isTerminal,
  estimateDelivery,
  estimateNextEta,
} from '../../utils/orderJourney';

const STATUS_META = {
  done:    { label: 'Completed', cls: 'text-[#FB461D] bg-[#FB461D]/10 border-[#FB461D]/25' },
  current: { label: 'Current',   cls: 'text-[#F7A321] bg-[#F7A321]/10 border-[#F7A321]/30' },
  pending: { label: 'Pending',   cls: 'text-gray-500 bg-gray-500/10 border-gray-500/20' },
};

const TERMINAL_UI = {
  cancelled:       { icon: XCircle,  color: '#EF4444', title: 'Order Cancelled',    desc: 'This order has been cancelled.' },
  rejected:        { icon: XCircle,  color: '#EF4444', title: 'Payment Rejected',   desc: 'The finance team rejected this payment. Our support will contact you.' },
  'payment failed':{ icon: Ban,      color: '#EF4444', title: 'Payment Failed',     desc: 'The payment for this order could not be processed.' },
  refunded:        { icon: RefreshCw, color: '#6B7280', title: 'Order Refunded',    desc: 'This order has been refunded.' },
};

const NodeIcon = ({ stage, isCompleted, isCurrent, isPending, progress, isLast }) => {
  const Icon = stage.icon;
  return (
    <div className="relative flex items-center justify-center">
      {isCurrent && (
        <>
          <span className="absolute inline-flex w-10 h-10 rounded-full bg-[#F7A321]/40 animate-ping" />
          <span className="absolute -inset-1.5 rounded-full border-2 border-dashed border-[#F7A321] animate-spin-slow" style={{ animation: 'spin 6s linear infinite' }} />
          <svg className="absolute -inset-2 -rotate-90" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
            <circle cx="28" cy="28" r="25" fill="none" stroke="rgba(247,163,33,0.25)" strokeWidth="3" />
            <circle
              cx="28" cy="28" r="25" fill="none" stroke="#F7A321" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 25}
              strokeDashoffset={2 * Math.PI * 25 * (1 - progress / 100)}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
        </>
      )}
      <div
        className={`relative z-10 w-11 h-11 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
          isCurrent
            ? 'bg-gradient-to-br from-[#F7A321] to-[#FB461D] border-white dark:border-nexus-navy text-white scale-110 shadow-glow'
            : isCompleted
              ? 'bg-gradient-to-br from-[#FB461D] to-[#FC6A48] border-[#FB461D] text-white'
              : 'bg-white dark:bg-nexus-surface border-gray-300 dark:border-nexus-border text-gray-400 dark:text-nexus-muted'
        }`}
      >
        <Icon size={20} strokeWidth={2.2} />
      </div>
      {isCompleted && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="absolute z-10 -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FB461D] text-white flex items-center justify-center shadow-sm"
        >
          <Check size={10} strokeWidth={3.5} />
        </motion.span>
      )}
      {isCurrent && isLast && (
        <span className="absolute z-10 -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#F7A321] text-white flex items-center justify-center shadow-sm">
          <Check size={10} strokeWidth={3.5} />
        </span>
      )}
    </div>
  );
};

const StepChip = ({ status }) => {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide border ${meta.cls}`}>
      {meta.label}
    </span>
  );
};

const HorizontalStep = ({ stage, isCompleted, isCurrent, isPending, progress, ts, user }) => {
  const state = isCurrent ? 'current' : isCompleted ? 'done' : 'pending';
  return (
    <div
      className="relative z-10 flex flex-col items-center flex-shrink-0 min-w-[96px] lg:min-w-0 lg:flex-1 px-1"
      role="listitem"
      aria-current={isCurrent ? 'step' : undefined}
      aria-label={`${stage.label}, ${STATUS_META[state].label}${ts ? `, ${formatJourneyDate(ts)}` : ''}`}
    >
      <div className="mb-2">
        <NodeIcon stage={stage} isCompleted={isCompleted} isCurrent={isCurrent} isPending={isPending} progress={progress} />
      </div>
      <p className={`text-center text-[10px] leading-tight font-semibold w-full hyphens-auto ${
        isCurrent ? 'text-[#F7A321]' : isCompleted ? 'text-nexus-heading' : 'text-gray-400 dark:text-nexus-muted'
      }`}>
        {stage.label}
      </p>
      {ts && (
        <p className="text-[9px] text-gray-400 dark:text-nexus-muted mt-0.5 text-center leading-tight">
          {formatJourneyDate(ts)} · {formatJourneyTime(ts)}
        </p>
      )}
      <p className={`text-[9px] font-medium ${isCompleted ? 'text-[#FB461D]' : 'text-gray-400 dark:text-nexus-muted'}`}>{stage.dept}</p>
      <div className="mt-1"><StepChip status={state} /></div>
    </div>
  );
};

const VerticalStep = ({ stage, isCompleted, isCurrent, isPending, progress, ts, user }) => {
  const state = isCurrent ? 'current' : isCompleted ? 'done' : 'pending';
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex gap-4 pb-7 last:pb-0"
      role="listitem"
      aria-current={isCurrent ? 'step' : undefined}
    >
      <div className="relative z-10 mt-0.5">
        <NodeIcon stage={stage} isCompleted={isCompleted} isCurrent={isCurrent} isPending={isPending} progress={progress} />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`font-semibold text-sm ${isCurrent ? 'text-[#F7A321]' : isCompleted ? 'text-nexus-heading' : 'text-gray-500 dark:text-nexus-muted'}`}>
            {stage.label}
          </p>
          <StepChip status={state} />
        </div>
        {ts && (
          <p className="text-xs text-gray-400 dark:text-nexus-muted mt-0.5">
            {formatJourneyDate(ts)} · {formatJourneyTime(ts)}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-nexus-muted">
          {stage.dept}{user ? ` · ${user}` : ''}
        </p>
      </div>
    </motion.li>
  );
};

const ProgressBar = ({ percent }) => (
  <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-nexus-surface overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${percent}%` }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="h-full rounded-full bg-gradient-brand relative"
    >
      <span className="absolute inset-0 bg-white/25 animate-pulse rounded-full" />
    </motion.div>
  </div>
);

const TerminalCard = ({ status }) => {
  const meta = TERMINAL_UI[(status || '').toLowerCase()] || TERMINAL_UI.cancelled;
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-10 text-center"
      role="status"
    >
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
        <Icon size={40} strokeWidth={2} />
      </div>
      <p className="text-xl font-bold text-nexus-heading">{meta.title}</p>
      <p className="text-sm text-nexus-textSecondary mt-1 max-w-sm">{meta.desc}</p>
    </motion.div>
  );
};

const NextStepCard = ({ status, order }) => {
  const next = getNextStage(status, order);
  const action = getNextAction(status, order);
  const NextIcon = action?.icon || next?.icon || null;
  const eta = estimateNextEta(status, order);
  const estDelivery = estimateDelivery(order);
  const key = (status || '').toLowerCase();

  if (['cancelled', 'refunded', 'rejected', 'payment failed', 'completed'].includes(key)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-[#FB461D]/20 bg-gradient-to-r from-[#FB461D]/[0.06] to-[#F7A321]/[0.06] dark:from-[#FB461D]/10 dark:to-[#F7A321]/10 p-4"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {NextIcon && <NextIcon size={22} className="text-[#FB461D] shrink-0" />}
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[#FB461D]">Next Action</p>
          {action ? (
            <>
              <p className="text-sm font-semibold text-nexus-heading">{action.title}</p>
              <p className="text-xs text-nexus-textSecondary mt-0.5">{action.detail}</p>
            </>
          ) : (
            <p className="text-sm font-semibold text-nexus-heading truncate">
              {next ? `${next.label} · ${next.dept} department` : 'Order journey complete'}
            </p>
          )}
        </div>
      </div>
      {!action && (
        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-0.5 text-sm">
          {eta && (
            <p className="text-xs text-nexus-textSecondary"><span className="font-semibold text-nexus-heading">{eta}</span> to complete</p>
          )}
          {estDelivery && key !== 'delivered' && (
            <p className="text-xs text-nexus-textSecondary">
              Est. delivery <span className="font-semibold text-nexus-heading">{formatJourneyDate(estDelivery.toISOString())}</span>
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

const TrackingTimeline = ({ order, statusHistory, status }) => {
  const statusKey = (status || order?.status || '').toLowerCase();
  const journey = getJourneyIndex(statusKey, order);
  const effectiveIndex = typeof journey === 'number' ? journey : journey.index;
  const isLowStock = typeof journey === 'object' && journey.lowStock && hasShortStock(order);
  const terminal = isTerminal(statusKey);
  const progress = getProgress(statusKey, order);
  const stageLog = buildStageLog(order, statusHistory);
  const lineInset = 100 / (ORDER_STAGES.length * 2);
  const lineFill = effectiveIndex >= 0 ? (effectiveIndex / (ORDER_STAGES.length - 1)) * 100 : 0;

  if (terminal) {
    return (
      <div className="relative">
        {isLowStock && <LowStockBanner />}
        <TerminalCard status={statusKey} />
      </div>
    );
  }

  return (
    <div className="relative">
      {isLowStock && <LowStockBanner />}

      {/* Progress header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-nexus-heading">Order Progress</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={progress}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-lg font-extrabold bg-gradient-to-r from-[#FB461D] to-[#F7A321] bg-clip-text text-transparent"
            >
              {progress}%
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="hidden sm:block text-xs text-nexus-textSecondary">
          {effectiveIndex >= 0 ? Math.min(ORDER_STAGES.length, Math.floor(effectiveIndex) + 1) : '—'} of {ORDER_STAGES.length} stages
        </span>
      </div>
      <ProgressBar percent={progress} />

      {/* Horizontal (tablet scrollable, desktop spread) */}
      <div className="hidden md:block relative mt-8">
        <div className="overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
          <div
            className="relative flex items-start min-w-[1344px] lg:min-w-0"
            role="list"
            aria-label="Order journey"
          >
            <div
              className="absolute top-[20px] h-[3px] rounded-full bg-gray-200 dark:bg-nexus-surface"
              style={{ left: `${lineInset}%`, right: `${lineInset}%` }}
              aria-hidden="true"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, lineFill)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-brand"
              />
            </div>
            {ORDER_STAGES.map((stage, i) => {
              const ts = stageLog[stage.id]?.at;
              const isCompleted = (effectiveIndex >= 0 && i < effectiveIndex) || !!ts;
              const isCurrent = effectiveIndex >= 0 && i === Math.floor(effectiveIndex) && !ts;
              const user = stageLog[stage.id]?.user;
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <HorizontalStep
                    stage={stage}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isPending={!isCompleted && !isCurrent}
                    progress={progress}
                    ts={ts}
                    user={user}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vertical (mobile) */}
      <div className="md:hidden mt-6">
        <ol className="relative" role="list" aria-label="Order journey">
          <div className="absolute left-[21px] top-2 bottom-2 w-[3px] rounded-full bg-gray-200 dark:bg-nexus-surface" aria-hidden="true">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(0, lineFill)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="w-full rounded-full bg-gradient-brand"
            />
          </div>
          {ORDER_STAGES.map((stage, i) => {
            const ts = stageLog[stage.id]?.at;
            const isCompleted = (effectiveIndex >= 0 && i < effectiveIndex) || !!ts;
            const isCurrent = effectiveIndex >= 0 && i === Math.floor(effectiveIndex) && !ts;
            const user = stageLog[stage.id]?.user;
            return (
              <VerticalStep
                key={stage.id}
                stage={stage}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isPending={!isCompleted && !isCurrent}
                progress={progress}
                ts={ts}
                user={user}
              />
            );
          })}
        </ol>
      </div>

      <NextStepCard status={statusKey} order={order} />
    </div>
  );
};

const hasShortStock = (order) => {
  const items = (order?.items || []).filter(i => i?.products?.stock != null);
  if (items.length === 0) return true;
  return items.some(i => Number(i.products.stock) < Number(i.quantity));
};

const LowStockBanner = () => (
  <div className="mb-5 p-4 bg-[#F7A321]/10 dark:bg-[#F7A321]/10 border border-[#F7A321]/25 rounded-xl flex items-center gap-3">
    <AlertTriangle size={20} className="text-[#F7A321] shrink-0" />
    <div>
      <p className="text-sm font-semibold text-[#F7A321]">Low Stock Detected</p>
      <p className="text-xs text-[#F7A321]">Insufficient inventory. A purchase request has been initiated to replenish stock.</p>
    </div>
  </div>
);

export default TrackingTimeline;
