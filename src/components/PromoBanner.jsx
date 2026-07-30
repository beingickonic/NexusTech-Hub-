import { motion } from 'framer-motion';

const PromoBanner = () => {
  return (
    <section className="py-20 px-4 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-full rounded-3xl overflow-hidden bg-[#0F172A] h-[400px] sm:h-[500px] flex items-center shadow-2xl border border-nexus-border"
      >
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1600" 
            alt="Workspace setup" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent"></div>
          
          {/* Glowing Gradients */}
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-primary/40 rounded-full blur-[120px]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 sm:px-16 md:px-24 max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6"
          >
            Boost Your <br/> Productivity.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-nexus-textSecondary mb-8 max-w-md"
          >
            Upgrade your workspace with our premium selection of ergonomic keyboards, high-res monitors, and precise mice.
          </motion.p>
          
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-dark-bg px-8 py-3.5 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            Shop Setup Gear
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

export default PromoBanner;
