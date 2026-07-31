import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Clock, RefreshCw } from 'lucide-react';

const badges = [
  {
    icon: <Truck size={24} />,
    title: 'Free Shipping',
    desc: 'On orders over Ksh 5,000',
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Secure Payments',
    desc: '100% protected',
  },
  {
    icon: <Clock size={24} />,
    title: '24/7 Support',
    desc: 'Dedicated team',
  },
  {
    icon: <RefreshCw size={24} />,
    title: 'Easy Returns',
    desc: '30-day guarantee',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const TrustBadges = () => {
  return (
    <section className="py-8 sm:py-12 bg-transparent dark:bg-nexus-bg transition-colors duration-300 relative z-20 -mt-6 sm:-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          {badges.map((badge, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card p-4 sm:p-6 flex flex-col items-center text-center group transition-all hover:shadow-2xl dark:hover:shadow-glow border-nexus-border/50 hover:border-primary/50"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                {badge.icon}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-nexus-heading mb-0.5 sm:mb-1">{badge.title}</h3>
              <p className="text-xs sm:text-sm text-nexus-textSecondary dark:text-nexus-muted">{badge.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustBadges;
