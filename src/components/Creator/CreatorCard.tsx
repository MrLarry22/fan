import React from 'react';
import { Users, Star, Heart, Play, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Creator } from '../../lib/supabase';

interface CreatorCardProps {
  creator: Creator;
  onSubscribe?: (creatorId: string) => void;
  isSubscribed?: boolean;
  featured?: boolean;
}

export default function CreatorCard({ creator, onSubscribe, isSubscribed, featured = false }: CreatorCardProps) {
  return (
    <motion.div 
      className={`bg-slate-800 rounded-xl overflow-hidden transition-all duration-300 border border-slate-700 hover:border-slate-600 ${featured ? '' : ''}`}
      whileHover={{ 
        scale: 1.03,
        y: -5,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        backgroundColor: "rgb(51, 65, 85)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {featured && (
        <motion.div 
          className="aspect-video bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {creator.avatar_url ? (
            <img
              src={creator.avatar_url}
              alt={creator.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white text-4xl font-bold">
              {creator.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white text-xl font-bold font-poppins mb-1">
              {creator.display_name}
            </h3>
            <div className="flex items-center text-white/80 text-sm">
              <Users className="w-4 h-4 mr-1" />
              {creator.total_subscribers} subscribers
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="p-6">
        {!featured && (
        <motion.div 
          className="flex items-center space-x-4 mb-4"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.display_name}
                className="w-16 h-16 object-cover"
              />
            ) : (
              <span className="text-white text-xl font-bold">
                {creator.display_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white font-poppins">
              {creator.display_name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {creator.total_subscribers} subscribers
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                4.8
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {creator.bio && (
          <motion.p 
            className="text-slate-300 text-sm mb-4 line-clamp-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {creator.bio}
          </motion.p>
        )}

        {/* Content Preview */}
        <motion.div 
          className="flex items-center space-x-4 mb-4 text-slate-400 text-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center">
            <Play className="w-4 h-4 mr-1" />
            {Math.floor(Math.random() * 50) + 10} videos
          </div>
          <div className="flex items-center">
            <ImageIcon className="w-4 h-4 mr-1" />
            {Math.floor(Math.random() * 100) + 20} photos
          </div>
          <div className="flex items-center">
            <Heart className="w-4 h-4 mr-1" />
            {Math.floor(Math.random() * 1000) + 100} likes
          </div>
        </motion.div>
        
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-white">
            <span className="text-2xl font-bold">$5</span>
            <span className="text-slate-400 text-sm">/month</span>
          </div>
          
          {onSubscribe && (
            <motion.button
              onClick={() => onSubscribe(creator.id)}
              disabled={isSubscribed}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isSubscribed
                  ? 'bg-green-600 text-white cursor-not-allowed flex items-center'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubscribed ? (
                <>
                  <Heart className="w-4 h-4 mr-2 fill-current" />
                  Subscribed
                </>
              ) : (
                'Subscribe'
              )}
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}