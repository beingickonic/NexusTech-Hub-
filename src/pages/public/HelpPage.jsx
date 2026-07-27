import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, ChevronDown, ChevronUp, ShoppingCart, CreditCard, Package,
  RotateCcw, User, Truck, MessageCircle, BookOpen, Shield, FileText
} from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    questions: [
      {
        q: 'How do I place an order?',
        a: 'Browse our product catalogue, add items to your cart, then proceed to checkout. Select your shipping address and preferred payment method (M-Pesa, Flutterwave, or PayPal) and confirm your order.'
      },
      {
        q: 'Can I modify or cancel my order after placing it?',
        a: 'You can cancel or modify your order within 1 hour of placing it, provided it has not yet been processed. Go to My Orders in your profile, select the order, and click "Cancel". For assistance, contact support immediately.'
      },
      {
        q: 'How do I track my order?',
        a: 'Log into your account and go to Profile → Orders. Each order shows its current status: Pending, Processing, Shipped, or Delivered. You will also receive email notifications at each stage.'
      },
      {
        q: 'What does "Pending" status mean?',
        a: '"Pending" means we have received your order and are waiting for payment confirmation. Once your payment clears, the status will update to "Processing".'
      },
    ]
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: CreditCard,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-500/10',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept M-Pesa (Safaricom STK Push), Flutterwave (Visa, Mastercard, bank transfer), and PayPal. All payments are processed securely and encrypted.'
      },
      {
        q: 'How does M-Pesa payment work?',
        a: 'At checkout, enter your M-Pesa phone number. You will receive a push notification on your phone prompting you to enter your M-Pesa PIN. Once confirmed, payment is processed instantly and your order status updates automatically.'
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes. We do not store your card or M-Pesa credentials on our servers. All payment processing is handled by certified third-party payment gateways (Safaricom Daraja, Flutterwave, PayPal) with industry-standard encryption.'
      },
      {
        q: 'I was charged but my order still shows "Pending". What do I do?',
        a: 'Payment confirmations can sometimes take a few minutes. Please wait 5–10 minutes and refresh your orders page. If the status does not update after 15 minutes, contact our support team with your transaction reference number.'
      },
      {
        q: 'Can I get an invoice?',
        a: 'Yes. Invoices are automatically generated for every completed order. You can find them in your account under Orders → View Invoice, or in the email confirmation you receive after purchase.'
      },
    ]
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    questions: [
      {
        q: 'Are all products genuine?',
        a: 'Yes. NexusTech Hub only stocks authentic, manufacturer-warranted products. All items come with official warranty documentation from the manufacturer or authorised distributor.'
      },
      {
        q: 'What warranty do products come with?',
        a: 'Most products carry a minimum 1-year manufacturer warranty. Specific warranty terms are listed on each product page. Extended warranty options may be available for select items.'
      },
      {
        q: 'Can I request a product that is not listed?',
        a: 'Yes! Contact us through the Contact page with the product name, model, and specifications. Our procurement team will check availability and provide a quote within 48 hours.'
      },
      {
        q: 'Are product prices inclusive of VAT?',
        a: 'All displayed prices are inclusive of applicable taxes. No hidden charges are added at checkout beyond the selected shipping option.'
      },
    ]
  },
  {
    id: 'returns',
    label: 'Returns & Refunds',
    icon: RotateCcw,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-500/10',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day return policy on all products. Items must be returned in their original, unopened packaging with all accessories and documentation included. Software and digital products are non-refundable once activated.'
      },
      {
        q: 'How do I initiate a return?',
        a: 'Go to Profile → Orders, find the order, and click "Request Return". Fill in the reason for return. Our team will review your request within 2 business days and provide return shipping instructions.'
      },
      {
        q: 'How long do refunds take?',
        a: 'Once we receive and inspect the returned item, refunds are processed within 5–7 business days. M-Pesa refunds typically reflect within 24 hours; card refunds may take 5–10 business days depending on your bank.'
      },
      {
        q: 'What if I received a damaged or wrong item?',
        a: 'We sincerely apologise. Please photograph the item immediately and contact support within 48 hours of delivery. We will arrange a free replacement or full refund at no additional cost.'
      },
    ]
  },
  {
    id: 'account',
    label: 'My Account',
    icon: User,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" on any page, enter your full name, email address, and a secure password. A verification email will be sent to confirm your account.'
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'On the login page, click "Forgot password?" and enter your registered email address. You will receive a secure reset link valid for 1 hour. Check your spam folder if you do not receive it within a few minutes.'
      },
      {
        q: 'How do I update my profile information?',
        a: 'Log in and go to Profile → Account. You can update your full name, phone number, and profile photo. To change your email or password, use the Settings section.'
      },
      {
        q: 'How do I delete my account?',
        a: 'To permanently delete your account, contact our support team at muriithiderrick08@gmail.com. Please note that account deletion is irreversible and all order history will be lost.'
      },
    ]
  },
  {
    id: 'shipping',
    label: 'Shipping',
    icon: Truck,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    questions: [
      {
        q: 'Where do you deliver?',
        a: 'We currently deliver across Kenya. Deliveries to Nairobi and major towns typically take 1–3 business days. Remote areas may take 3–7 business days.'
      },
      {
        q: 'How much does shipping cost?',
        a: 'Shipping fees are calculated based on your location and order size. The exact shipping cost is displayed at checkout before you confirm your order. We run free shipping promotions regularly — watch for announcements on our homepage.'
      },
      {
        q: 'Do you offer same-day delivery?',
        a: 'Same-day delivery is available for Meru and select nearby areas for orders placed before 11 AM on business days. Contact us to confirm availability for your specific location.'
      },
    ]
  },
];

const AccordionItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border-b border-slate-200 dark:border-white/10 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-5 text-left group"
    >
      <span className={`font-medium text-sm sm:text-base transition-colors ${isOpen ? 'text-primary' : 'text-slate-900 dark:text-white group-hover:text-primary'}`}>
        {question}
      </span>
      {isOpen
        ? <ChevronUp size={18} className="text-primary flex-shrink-0 ml-4" />
        : <ChevronDown size={18} className="text-slate-400 flex-shrink-0 ml-4" />
      }
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="pb-5 text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
            {answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('orders');
  const [openQuestion, setOpenQuestion] = useState(null);
  const [activeGuide, setActiveGuide] = useState(null);

  // Filter FAQs based on search
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results = [];
    FAQ_CATEGORIES.forEach(cat => {
      cat.questions.forEach(item => {
        if (item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)) {
          results.push({ ...item, category: cat.label, categoryId: cat.id });
        }
      });
    });
    return results;
  }, [searchQuery]);

  const activeData = FAQ_CATEGORIES.find(c => c.id === activeCategory);

  const guides = [
    { id: 'getting-started', icon: BookOpen, title: 'Getting Started', desc: 'New to NexusTech Hub? Learn how to create an account, browse products, and place your first order.' },
    { id: 'privacy', icon: Shield, title: 'Privacy Policy', desc: 'How we collect, use, and protect your personal information.' },
    { id: 'terms', icon: FileText, title: 'Terms & Conditions', desc: 'Our terms of service, user obligations, and legal information.' },
  ];

  const guideContent = {
    'getting-started': `
**Welcome to NexusTech Hub!**

Here's how to get started in 3 simple steps:

**Step 1 — Create your account**
Click "Sign Up" in the top navigation bar. Enter your name, email, and a secure password. You'll receive a confirmation email.

**Step 2 — Browse & add to cart**
Use the search bar or browse by category to find products. Click "Add to Cart" on any product page. You can add multiple items before checking out.

**Step 3 — Checkout & pay**
Go to your Cart, review your items, then click "Checkout". Enter your shipping details and choose a payment method. For M-Pesa: enter your phone number and approve the push notification on your device.

Your order confirmation and tracking information will be sent to your email.
    `.trim(),
    'privacy': `
**Privacy Policy — NexusTech Hub**

Last updated: January 2025

**Information we collect:**
- Account information: name, email, phone number
- Order information: shipping address, purchase history
- Payment information: processed by third-party providers (we never store card or M-Pesa credentials)
- Device information: browser type, IP address for security purposes

**How we use your information:**
- To process and deliver your orders
- To send order confirmations and shipping updates
- To improve our products and services
- To send promotional emails (with your consent)

**Data sharing:**
We do not sell your personal information. We share data only with:
- Payment processors (Safaricom, Flutterwave, PayPal) as required to process payments
- Delivery partners as required to ship your orders

**Your rights:**
You have the right to access, update, or delete your personal information at any time. Contact us at muriithiderrick08@gmail.com.

**Cookies:**
We use essential cookies to maintain your session and shopping cart. We do not use advertising or tracking cookies.
    `.trim(),
    'terms': `
**Terms & Conditions — NexusTech Hub**

Last updated: January 2025

**1. Acceptance of Terms**
By using NexusTech Hub, you agree to these terms and our Privacy Policy.

**2. Account Responsibilities**
You are responsible for keeping your password secure and for all activity on your account. Notify us immediately of any unauthorized access.

**3. Product Listings**
Prices and availability are subject to change. We reserve the right to cancel orders in cases of pricing errors or stock unavailability.

**4. Payment Terms**
All prices are in Kenyan Shillings (KES) unless stated otherwise. Payment is required in full before order dispatch.

**5. Intellectual Property**
All content, trademarks, and product images on this site are the property of NexusTech Hub or respective manufacturers.

**6. Limitation of Liability**
NexusTech Hub is not liable for indirect or consequential damages arising from product use.

**7. Governing Law**
These terms are governed by the laws of the Republic of Kenya.

**8. Contact**
For legal enquiries, contact us at muriithiderrick08@gmail.com.
    `.trim(),
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-dark-bg min-h-screen transition-colors duration-300">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            How can we help?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-slate-400 mb-8 text-lg"
          >
            Search our help centre or browse by category below.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setOpenQuestion(null); }}
              placeholder="Search help articles..."
              className="w-full bg-white dark:bg-slate-800 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-xl"
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">

        {/* Search Results */}
        {filteredResults !== null && (
          <div className="mb-16">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {filteredResults.length > 0
                ? `Found ${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                : `No results found for "${searchQuery}"`
              }
            </h2>
            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-gray-400 mb-6">Try different keywords or browse categories below.</p>
                <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors">
                  <MessageCircle size={18} /> Contact Support
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">{item.category}</span>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.q}</h3>
                    <p className="text-slate-500 dark:text-gray-400 text-sm">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!searchQuery && (
          <>
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3 mb-10">
              {FAQ_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setOpenQuestion(null); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-glow'
                        : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/10 hover:text-primary hover:border-primary'
                    }`}
                  >
                    <Icon size={16} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Active Category FAQs */}
            {activeData && (
              <div className="grid lg:grid-cols-3 gap-10 mb-20">
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm p-8">
                    <div className={`w-12 h-12 rounded-2xl ${activeData.bg} flex items-center justify-center mb-6`}>
                      <activeData.icon size={24} className={activeData.color} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{activeData.label}</h2>
                    {activeData.questions.map((item, idx) => (
                      <AccordionItem
                        key={idx}
                        question={item.q}
                        answer={item.a}
                        isOpen={openQuestion === `${activeData.id}-${idx}`}
                        onToggle={() => setOpenQuestion(openQuestion === `${activeData.id}-${idx}` ? null : `${activeData.id}-${idx}`)}
                      />
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <MessageCircle size={20} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Still need help?</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
                      Can't find your answer? Our support team is ready to help.
                    </p>
                    <Link
                      to="/contact"
                      className="block w-full text-center bg-primary hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-glow text-sm"
                    >
                      Contact Support
                    </Link>
                  </div>

                  <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Other Categories</h3>
                    <div className="space-y-2">
                      {FAQ_CATEGORIES.filter(c => c.id !== activeCategory).map(cat => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setOpenQuestion(null); window.scrollTo(0, 0); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-gray-400 hover:text-primary text-sm font-medium"
                          >
                            <Icon size={16} className={cat.color} />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guides Section */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Guides & Policies</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {guides.map(guide => {
                  const Icon = guide.icon;
                  return (
                    <button
                      key={guide.id}
                      onClick={() => setActiveGuide(activeGuide === guide.id ? null : guide.id)}
                      className="text-left bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm p-6 hover:border-primary/40 hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon size={24} className="text-primary" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2">{guide.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-gray-400">{guide.desc}</p>
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {activeGuide && guideContent[activeGuide] && (
                  <motion.div
                    key={activeGuide}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-6 bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm p-8"
                  >
                    <pre className="whitespace-pre-wrap text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-sans">
                      {guideContent[activeGuide]}
                    </pre>
                    <button
                      onClick={() => setActiveGuide(null)}
                      className="mt-6 text-sm text-slate-400 hover:text-primary transition-colors"
                    >
                      Close ↑
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HelpPage;
