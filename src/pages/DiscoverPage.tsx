import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, Star, Heart, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { supabase, Creator } from '../lib/supabase';
import CreatorCard from '../components/Creator/CreatorCard';
import AuthModal from '../components/Auth/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

// Simple FAQ Accordion Component
function FAQAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-750 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white pr-4">
              {item.question}
            </h3>
            <div className={`transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          </button>
          
          {openIndex === index && (
            <div className="px-6 pb-4 text-slate-300 leading-relaxed">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Simple Animated Section Component
function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number; 
}) {
  return (
    <div className={className} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

// Simple ScrollReveal Component
function ScrollReveal({ 
  children, 
  direction = 'up', 
  delay = 0 
}: { 
  children: React.ReactNode; 
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale'; 
  delay?: number; 
}) {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
        x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
        scale: direction === 'scale' ? 0.8 : 1
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        x: 0, 
        scale: 1 
      }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function DiscoverPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sortBy, setSortBy] = useState<'subscribers' | 'newest' | 'revenue'>('subscribers');
  const { user, profile } = useAuth();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    fetchCreators();
  }, [sortBy]);

  const fetchCreators = async () => {
    try {
      let query = supabase
        .from('creators')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('is_active', true);

      // Apply sorting
      switch (sortBy) {
        case 'subscribers':
          query = query.order('total_subscribers', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'revenue':
          query = query.order('total_revenue', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setCreators(data || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (creatorId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    console.log('Subscribe to creator:', creatorId);
  };

  const filteredCreators = creators.filter(creator =>
    creator.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const faqItems = [
    {
      question: "How much does a subscription cost?",
      answer: "Each creator subscription costs $5 per month. You can subscribe to multiple creators independently."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We currently accept PayPal subscriptions. More payment options including credit cards and Google Pay are coming soon."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period."
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely. We use industry-standard encryption and security measures to protect your personal information and payment details."
    },
    {
      question: "How do I access creator content?",
      answer: "Once you subscribe to a creator, you'll have unlimited access to all their content through your personal dashboard."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <motion.div 
        className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 py-20 relative overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Animated Background Elements */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-xl"
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6 font-poppins"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              Discover Amazing
              <motion.span 
                className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              >
                {' '}Creators
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              Subscribe to your favorite creators and get exclusive access to their premium content. 
              Join thousands of users discovering incredible content every day.
            </motion.p>
            
            <motion.div 
              className="max-w-md mx-auto relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search creators by name or interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Featured In Section */}
      <ScrollReveal direction="fade" delay={0.2}>
        <div className="bg-slate-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-white font-poppins mb-4">
                Why Choose Fanview?
              </h2>
              <p className="text-slate-300 text-lg max-w-3xl mx-auto">
                Connect with your favorite creators like never before
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              {/* Messaging Feature */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-2xl">💬</span>
                </motion.div>
                <h3 className="text-xl font-bold text-white font-poppins mb-4">
                  Messaging
                </h3>
                <p className="text-slate-300 mb-4">
                  Connect with your creators with Messaging
                </p>
                <p className="text-slate-400 text-sm">
                  Connect with your creators via direct messages - paid or for free!
                </p>
              </motion.div>

              {/* Pay-to-view Feature */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-2xl">👀</span>
                </motion.div>
                <h3 className="text-xl font-bold text-white font-poppins mb-4">
                  Pay-to-view
                </h3>
                <p className="text-slate-300 mb-4">
                  Buy content with Pay-to-View
                </p>
                <p className="text-slate-400 text-sm">
                  Access your most exclusive content with pay-to-views.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Featured Creators Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured In Section */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center mb-12">
            <p className="text-slate-400 text-sm mb-6 uppercase tracking-wider">Featured in</p>
            <motion.div 
              className="flex items-center justify-center space-x-8 md:space-x-12 mb-16 opacity-60"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              {['Forbes', 'UNILAD', 'New York Post', 'Business Insider', 'The Telegraph'].map((brand, index) => (
                <motion.div 
                  key={brand}
                  className="text-slate-300 font-bold text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 0.6, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                >
                  {brand}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </ScrollReveal>

        {/* Main Heading */}
        <ScrollReveal direction="scale" delay={0.3}>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white font-poppins mb-4">
              TRUSTED BY THE WORLD'S
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                BIGGEST CREATORS
              </span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Featured Creators Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* Aitana Lopez */}
          <motion.div 
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 transition-all duration-300 text-center group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ 
              scale: 1.05, 
              y: -10,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-slate-600 group-hover:ring-blue-400 transition-all">
              <img
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                alt="Aitana Lopez"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Aitana Lopez</h3>
            <p className="text-slate-400 text-sm">AI Creator | 350k+ followers</p>
          </motion.div>

          {/* Darren Till */}
          <motion.div 
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 transition-all duration-300 text-center group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ 
              scale: 1.05, 
              y: -10,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-slate-600 group-hover:ring-blue-400 transition-all">
              <img
                src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                alt="Darren Till"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Darren Till</h3>
            <p className="text-slate-400 text-sm">UFC Title Contender</p>
          </motion.div>

          {/* Lana Scolaro */}
          <motion.div 
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 transition-all duration-300 text-center group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ 
              scale: 1.05, 
              y: -10,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-slate-600 group-hover:ring-blue-400 transition-all">
              <img
                src="https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                alt="Lana Scolaro"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Lana Scolaro</h3>
            <p className="text-slate-400 text-sm">DJ | 2.1m followers</p>
          </motion.div>

          {/* Chesca */}
          <motion.div 
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 transition-all duration-300 text-center group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ 
              scale: 1.05, 
              y: -10,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-slate-600 group-hover:ring-blue-400 transition-all">
              <img
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                alt="Chesca"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Chesca</h3>
            <p className="text-slate-400 text-sm">Music Artist | 480k followers</p>
          </motion.div>

          {/* Ben Morris */}
          <motion.div 
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 transition-all duration-300 text-center group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ 
              scale: 1.05, 
              y: -10,
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-slate-600 group-hover:ring-blue-400 transition-all">
              <img
                src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                alt="Ben Morris"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Ben Morris</h3>
            <p className="text-slate-400 text-sm">YouTube | 770k subscribers</p>
          </motion.div>
        </motion.div>

        {/* Sorting and Filters */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white font-poppins">
                All Creators
              </h2>
            </div>
            
            <motion.select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              whileHover={{ scale: 1.02 }}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <option value="subscribers">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="revenue">Top Earning</option>
            </motion.select>
        </motion.div>

        {loading ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i} 
                className="bg-slate-800 rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <motion.div 
                    className="w-16 h-16 bg-slate-700 rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div className="flex-1">
                    <motion.div 
                      className="h-4 bg-slate-700 rounded mb-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div 
                      className="h-3 bg-slate-700 rounded w-2/3"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
                <motion.div 
                  className="h-3 bg-slate-700 rounded mb-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                />
                <motion.div 
                  className="h-3 bg-slate-700 rounded w-3/4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {filteredCreators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <CreatorCard
                  creator={creator}
                  onSubscribe={handleSubscribe}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && filteredCreators.length === 0 && (
          <ScrollReveal direction="fade">
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                {searchTerm ? 'No creators found matching your search.' : 'No creators available.'}
              </p>
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* FAQ Section */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="bg-slate-800 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-white font-poppins mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-300">
                Everything you need to know about Fanview
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <FAQAccordion items={faqItems} />
            </motion.div>
          </div>
        </div>
      </ScrollReveal>

      {/* Footer */}
      <ScrollReveal direction="up" delay={0.1}>
        <footer className="bg-slate-900 border-t border-slate-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Company Info */}
              <motion.div 
                className="col-span-1 md:col-span-2"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <motion.div 
                  className="flex items-center space-x-2 mb-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white font-poppins">Fanview</span>
                </motion.div>
                <p className="text-slate-400 mb-4 max-w-md">
                  The premier subscription-based content platform connecting users with their favorite creators.
                </p>
                <p className="text-slate-500 text-sm">
                  📍 Based in California, United States
                </p>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  {[
                    { to: "/about", text: "About Us" },
                    { to: "/how-it-works", text: "How It Works" },
                    { to: "/creators", text: "Creators" },
                    { to: "/support", text: "Support" }
                  ].map((link, index) => (
                    <motion.li 
                      key={link.to}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <Link 
                        to={link.to} 
                        className="text-slate-400 hover:text-white transition-colors inline-block hover:translate-x-1 transform transition-transform"
                      >
                        {link.text}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Legal */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  {profile?.role === 'admin' && (
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <Link 
                        to="/admin" 
                        className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1 hover:translate-x-1 transform transition-transform"
                      >
                        <span>👑</span>
                        <span>Admin Dashboard</span>
                      </Link>
                    </motion.li>
                  )}
                  {[
                    { to: "/privacy", text: "Privacy Policy" },
                    { to: "/terms", text: "Terms of Service" },
                    { to: "/cookies", text: "Cookie Policy" },
                    { to: "/dmca", text: "DMCA" }
                  ].map((link, index) => (
                    <motion.li 
                      key={link.to}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <Link 
                        to={link.to} 
                        className="text-slate-400 hover:text-white transition-colors inline-block hover:translate-x-1 transform transition-transform"
                      >
                        {link.text}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>

            <motion.div 
              className="border-t border-slate-800 mt-8 pt-8 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <p className="text-slate-500 text-sm">
                © 2025 Fanview. All rights reserved. | Age verification required - 18+ only
              </p>
            </motion.div>
          </div>
        </footer>
      </ScrollReveal>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}