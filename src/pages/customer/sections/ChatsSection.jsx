import { motion } from 'framer-motion';
import { MessageCircle, Zap, Bell } from 'lucide-react';

const ChatsSection = () => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chats with Sellers</h1>
      <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Real-time messaging with sellers</p>
    </div>

    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-2xl overflow-hidden">
      {/* Animated preview header */}
      <div className="bg-gradient-to-r from-[#FF6B57]/10 to-transparent p-6 border-b border-slate-200 dark:border-[#1F2937] flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#FF6B57]/20 flex items-center justify-center">
          <MessageCircle size={24} className="text-[#FF6B57]" />
        </div>
        <div>
          <p className="text-slate-900 dark:text-white font-semibold">Seller Chat</p>
          <p className="text-slate-500 dark:text-gray-400 text-xs">Powered by Supabase Realtime</p>
        </div>
      </div>

      {/* Coming soon */}
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-[#FF6B57]/10 flex items-center justify-center">
            <MessageCircle size={44} className="text-[#FF6B57]/60" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full border-2 border-[#FF6B57]/30"
          />
        </div>

        <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-2">Coming Soon</h3>
        <p className="text-slate-500 dark:text-gray-400 text-sm max-w-sm mb-8">
          Real-time seller chat is being built on Supabase Realtime. You'll be able to message sellers directly about products and orders.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 w-full max-w-lg">
          {[
            { icon: Zap,       label: 'Real-time',      desc: 'Instant delivery via Supabase Realtime' },
            { icon: Bell,      label: 'Notifications',  desc: 'Push alerts for new messages' },
            { icon: MessageCircle, label: 'Threaded',  desc: 'Per-product conversation threads' },
          ].map(f => (
            <div key={f.label} className="bg-white dark:bg-[#0C1220] border border-slate-200 dark:border-[#1F2937] rounded-xl p-4 text-center">
              <div className="w-9 h-9 rounded-lg bg-[#FF6B57]/10 flex items-center justify-center mx-auto mb-2">
                <f.icon size={17} className="text-[#FF6B57]" />
              </div>
              <p className="text-slate-900 dark:text-white text-xs font-semibold mb-1">{f.label}</p>
              <p className="text-slate-500 dark:text-gray-500 text-xs leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-2 px-4 py-2.5 bg-[#FF6B57]/10 border border-[#FF6B57]/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#FF6B57] animate-pulse" />
          <span className="text-[#FF6B57] text-xs font-semibold">In development — launching soon</span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default ChatsSection;
