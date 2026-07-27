import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Users, ShieldCheck, CreditCard, Truck, Headphones, FileCheck, Award, Lightbulb, Heart, Star, UserRound, BarChart3, Phone, Mail, MapPin } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const AboutPage = () => {
  useEffect(() => {
    document.title = 'About Us | NexusTech Hub';
  }, []);

  return (
    <div className="bg-[#F8FAFC] dark:bg-dark-bg min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 blur-[100px] rounded-full w-[600px] h-[600px] left-1/2 -translate-x-1/2 top-0 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6"
          >
            About NexusTech Hub
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Technology That Powers Your Lifestyle
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-slate-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            At NexusTech Hub, we believe that cutting-edge technology should be accessible, beautiful, and seamlessly integrated into your everyday life.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-200 dark:border-white/10 bg-white dark:bg-dark-surface transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Happy Customers', value: '10,000+' },
            { label: 'Products Sold', value: '5,000+' },
            { label: 'Satisfaction Rate', value: '98%' },
            { label: 'Support', value: '24/7' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story / Mission */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Our Mission</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed mb-6">
              Founded in 2024, NexusTech Hub was born out of a simple frustration: finding high-quality, reliable, and aesthetically pleasing tech gear was too difficult. We set out to curate a premium collection of the world's best technology, bringing it all together in one beautiful shopping experience.
            </p>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              We carefully vet every single product that makes it onto our platform. From the tactile feel of a mechanical keyboard switch to the noise-canceling capabilities of over-ear headphones, we ensure that what you buy actually enhances your workflow and life.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl -translate-x-4 translate-y-4 -z-10" />
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
              alt="Team working"
              className="rounded-3xl shadow-xl w-full object-cover aspect-video md:aspect-square"
            />
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Why Choose NexusTech</h2>
            <p className="text-slate-500 dark:text-gray-400">The core values that drive our business forward.</p>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: ShieldCheck, title: 'Genuine Products', desc: 'Every product is sourced from authorized distributors with full authenticity guarantees.' },
              { icon: CreditCard, title: 'Secure Payments', desc: 'Bank-grade encryption protects every transaction, including M-Pesa and card payments.' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Same-day and express delivery options across Kenya with real-time tracking.' },
              { icon: Headphones, title: 'Expert Support', desc: 'Dedicated tech advisors available to help you choose the right products.' },
              { icon: FileCheck, title: 'Warranty Protection', desc: 'Comprehensive manufacturer warranties and after-sales support on all items.' },
              { icon: Award, title: 'Trusted Technology Partner', desc: 'Rated by thousands of Kenyan customers for quality, speed, and reliability.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-[#F8FAFC] dark:bg-dark-bg border border-slate-200 dark:border-white/5 hover:border-primary/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Our Core Values</h2>
            <p className="text-slate-500 dark:text-gray-400">The principles that guide everything we do.</p>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 lg:grid-cols-5 gap-6"
          >
            {[
              { icon: Lightbulb, title: 'Innovation' },
              { icon: Heart, title: 'Trust' },
              { icon: Star, title: 'Quality' },
              { icon: UserRound, title: 'Customer First' },
              { icon: BarChart3, title: 'Growth' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-white/5 hover:border-primary/30 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                  <item.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Meet Our Leadership</h2>
            <p className="text-slate-500 dark:text-gray-400">The people behind NexusTech Hub.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { role: 'Founder & CEO', desc: 'Visionary leader driving tech innovation in Kenya.' },
              { role: 'Operations Lead', desc: 'Ensuring seamless logistics and customer experience.' },
              { role: 'Customer Support', desc: 'Dedicated to resolving your queries with care.' },
              { role: 'Sales & Partnerships', desc: 'Building trusted relationships with top brands.' },
            ].map((member, i) => (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-dark-bg border border-slate-200 dark:border-white/5 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                  <UserRound size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{member.role}</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-orange-500 p-12 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Need Help Choosing Tech Products?</h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10">
                Contact NexusTech Hub today and let our experts guide you to the perfect tech solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold py-4 px-8 rounded-xl transition-all hover:bg-gray-50 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] focus:ring-4 focus:ring-white/50 outline-none"
                  aria-label="Contact Us"
                >
                  <Phone size={18} />
                  Contact Us
                </Link>
                <Link
                  to="/products"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-4 px-8 rounded-xl border border-white/20 transition-all hover:bg-white/20 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-white/30 outline-none"
                  aria-label="Shop Products"
                >
                  Shop Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
