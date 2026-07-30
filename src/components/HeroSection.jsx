import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#F4F4F8] dark:bg-gradient-cinematic min-h-[100svh] sm:min-h-[90vh] flex items-center transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-56 sm:w-72 md:w-96 h-56 sm:h-72 md:h-96 bg-primary/40 dark:bg-primary/30 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 bg-accent/40 dark:bg-accent/20 rounded-full blur-[60px] sm:blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-5 mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-16 sm:py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left Text Content */}
          <div className="flex flex-col items-start gap-5 text-center sm:text-left items-center sm:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20"
            >
              Premium Electronics 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white"
            >
              Smart Tech. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Better Living.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-gray-300 max-w-lg leading-relaxed"
            >
              Discover the next generation of premium gadgets designed to elevate
              your everyday experience. Shop curated technology with unparalleled design.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 w-full"
            >
              <Link
                to="/products"
                className="bg-primary hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold transition-all shadow-glow flex items-center gap-2 hover:-translate-y-1 text-sm sm:text-base"
              >
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link
                to="/products"
                className="bg-white hover:bg-slate-50 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl dark:shadow-none backdrop-blur-sm border border-slate-200 dark:border-nexus-border hover:-translate-y-1 text-sm sm:text-base"
              >
                Explore Deals
              </Link>
            </motion.div>
          </div>

          {/* Right Imagery — hidden on small phones, shown from sm up */}
          <div className="relative h-[280px] xs:h-[340px] sm:h-[440px] lg:h-[520px] w-full flex items-center justify-center mt-4 lg:mt-0">

            {/* Main Product Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="relative z-20 w-2/3 sm:w-3/4 max-w-xs sm:max-w-md drop-shadow-2xl"
            >
              <motion.img
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800&h=800"
                alt="Premium Headphones"
                className="w-full object-cover rounded-full"
                style={{ clipPath: 'circle(48% at 50% 50%)' }}
              />
            </motion.div>

            {/* Floating notification — hidden on very small screens */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute top-1/4 right-0 z-30 glass px-3 sm:px-4 py-2 sm:py-3 rounded-2xl flex items-center gap-2 sm:gap-3 shadow-xl hidden xs:flex"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-sm">
                ✓
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-nexus-textSecondary dark:text-gray-400 font-medium">Just Purchased</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Sony WH-1000XM5</p>
              </div>
            </motion.div>

            {/* Floating watch bubble — hidden on very small screens */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute bottom-4 sm:bottom-10 left-0 z-10 w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-dark-surface shadow-2xl hidden xs:block"
            >
              <motion.img
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=300&h=300"
                alt="Smartwatch"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
