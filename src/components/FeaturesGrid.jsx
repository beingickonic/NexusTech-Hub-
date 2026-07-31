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
    <section className="py-16 bg-white dark:bg-nexus-bg transition-colors duration-300 border-t border-nexus-border">
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
              className="flex items-start gap-4 p-6 rounded-2xl bg-nexus-card shadow-md dark:shadow-soft border border-nexus-border dark:border-transparent hover:border-primary/30 transition-all duration-300 hover:shadow-xl dark:hover:shadow-glow group cursor-default"
            >
              <div className="flex-shrink-0 text-nexus-muted dark:text-nexus-muted group-hover:text-primary transition-colors">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-nexus-heading mb-1 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm text-nexus-textSecondary dark:text-nexus-muted">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
