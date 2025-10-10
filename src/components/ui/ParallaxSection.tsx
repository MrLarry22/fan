import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export default function ParallaxSection({ 
  children, 
  className = '',
  speed = 0.5 
}: ParallaxSectionProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * speed]);

  return (
    <motion.div
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
}