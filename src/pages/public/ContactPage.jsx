import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-dark-bg min-h-screen transition-colors duration-300 py-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 dark:text-gray-400"
          >
            Have a question about a product? Need help with an order? We're here to help.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Mail size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Email Us</h3>
              <p className="text-slate-500 dark:text-gray-400 mb-4">Our friendly team is here to help.</p>
              <a href="mailto:muriithiderrick08@gmail.com" className="text-primary font-medium hover:underline">muriithiderrick08@gmail.com</a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Phone size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Call Us</h3>
              <p className="text-slate-500 dark:text-gray-400 mb-4">Mon-Fri from 8am to 5pm.</p>
              <a href="tel:+254728097596" className="text-primary font-medium hover:underline">+254 728 097 596</a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Visit Us</h3>
              <p className="text-slate-500 dark:text-gray-400 mb-4">Visit our tech showroom.</p>
              <address className="not-italic text-slate-900 dark:text-white font-medium">
                Meru, 6200
              </address>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-white/10 p-8 md:p-12 shadow-sm relative overflow-hidden"
          >
            {isSubmitted && (
              <div className="absolute inset-0 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-glow">
                  <Send size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                <p className="text-slate-500 dark:text-gray-400">We'll get back to you as soon as possible.</p>
              </div>
            )}

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Full Name</label>
                  <input 
                    type="text" id="name" name="name" required
                    value={formData.name} onChange={handleChange}
                    className="w-full bg-[#F8FAFC] dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Mary Ivy"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Email Address</label>
                  <input 
                    type="email" id="email" name="email" required
                    value={formData.email} onChange={handleChange}
                    className="w-full bg-[#F8FAFC] dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Ivy@gmail.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Subject</label>
                <input 
                  type="text" id="subject" name="subject" required
                  value={formData.subject} onChange={handleChange}
                  className="w-full bg-[#F8FAFC] dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="How can we help you?"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-gray-300">Message</label>
                <textarea 
                  id="message" name="message" rows="5" required
                  value={formData.message} onChange={handleChange}
                  className="w-full bg-[#F8FAFC] dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Write your message here..."
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-glow transition-all hover:-translate-y-0.5"
              >
                Send Message
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
