import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  return (
    <div
      className="flex justify-center items-center h-8 w-8 mx-auto" // Added mx-auto for consistent centering
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
      <motion.div
        style={{
          width: '100%',
          height: '86.6%', // Maintain hexagon aspect ratio within the container
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          backgroundColor: '#00ADB5', // brand-accent color
        }}
        animate={{
          scale: [0, 1], // Scale from 0% to 100% of the container size
          opacity: [0, 1, 0], // Start invisible, fade in, then vanish to create a seamless loop
        }}
        transition={{
          duration: 1.7,
          repeat: Infinity,
          ease: "easeOut",
          // Opacity keyframes: fade in until 85% of duration, then fade out for the last 15%.
          times: [0, 0.85, 1],
        }}
      />
    </div>
  );
};

export default Loader;
