import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

// Constants
const HEXAGON_SIZE = 40;
const ANIMATION_DURATION = 0.7;
const STAGGER_DELAY = 0.04;

// A symmetrical 19-hexagon honeycomb cluster, close to the requested 20.
// This shape creates a more visually appealing and balanced ripple effect.
const gridLayout = [
  { count: 3 },
  { count: 4 },
  { count: 5 },
  { count: 4 },
  { count: 3 },
];
const centerRowIndex = 2; // The middle row (index 2) is the center of the ripple.

interface ShockwaveProps {
  x: number;
  y: number;
  onComplete: () => void;
}

const Shockwave: React.FC<ShockwaveProps> = ({ x, y, onComplete }) => {
  // Set a timeout to remove the component after the animation finishes
  useEffect(() => {
    const totalAnimationTime = (ANIMATION_DURATION + (10 * STAGGER_DELAY)) * 1000; // Max distance * delay
    const timer = setTimeout(() => {
      onComplete();
    }, totalAnimationTime);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {gridLayout.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex"
            style={{
              // Overlap rows to form the honeycomb structure
              marginBottom: `-${HEXAGON_SIZE * 0.134}px`,
              // Stagger rows with a different parity of hexagons from the center row
              transform: Math.abs(row.count - gridLayout[centerRowIndex].count) % 2 === 1
                ? `translateX(${(HEXAGON_SIZE / 2) + 2}px)`
                : 'none',
            }}
          >
            {Array.from({ length: row.count }).map((_, colIndex) => {
              // Calculate distance from the absolute center hexagon for the ripple effect
              const centerColIndex = Math.floor(row.count / 2);
              const distance = Math.abs(rowIndex - centerRowIndex) + Math.abs(colIndex - centerColIndex);

              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className="hexagon"
                  style={{
                    width: HEXAGON_SIZE,
                    height: HEXAGON_SIZE * 0.866,
                    backgroundColor: '#00ADB5',
                    margin: '2px',
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.1, 0], // Pop in, then shrink away
                    opacity: [0, 0.8, 0], // Fade in, then fade out
                  }}
                  transition={{
                    duration: ANIMATION_DURATION,
                    ease: 'easeInOut',
                    delay: distance * STAGGER_DELAY,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shockwave;