import { motion } from 'framer-motion';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

const features = [
  {
    icon: <Truck size={28} />,
    title: 'Free Shipping',
    desc: 'Worldwide from Ksh 5,000',
  },
  {
    icon: <ShieldCheck size={28} />,
    title: 'Secure Payments',
    desc: 'Protected by Stripe',
  },
  {
    icon: <RefreshCw size={28} />,
    title: 'Easy Returns',
    desc: 'Hassle-free 30 days',
  },
  {
    icon: <Headphones size={28} />,
    title: '24/7 Support',
    desc: 'Always here for you',
  },
];

const FeaturesGrid = () => {
  return (
    <section className="py-16 bg-white dark:bg-dark-bg transition-colors duration-300 border-t border-gray-100 dark:border-nexus-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-dark-surface shadow-md dark:shadow-soft border border-slate-200 dark:border-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-xl dark:hover:shadow-glow group cursor-default"
            >
              <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm text-nexus-textSecondary dark:text-gray-400">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
