import React, { useState, useEffect, useMemo } from 'react';
// FIX: Import Variants and useAnimationControls type from framer-motion to resolve type errors.
import { motion, AnimatePresence, Variants, useAnimationControls } from 'framer-motion';

const HEXAGON_SIZE = 80; // size in pixels
const HEXAGON_MARGIN = 2;

const Hexagon: React.FC<{
    animationControls: ReturnType<typeof useAnimationControls>;
    rowIndex: number;
    colIndex: number;
}> = ({ animationControls, rowIndex, colIndex }) => {
    return (
        <motion.div
            className="hexagon"
            initial={{ scale: 0, opacity: 0 }}
            animate={animationControls}
            custom={{ row: rowIndex, col: colIndex }}
            style={{ 
                width: HEXAGON_SIZE, 
                height: HEXAGON_SIZE * 0.866,
                margin: HEXAGON_MARGIN
            }}
        />
    );
};

const useWindowSize = () => {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        const updateSize = () => {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
};

const HexagonLoader: React.FC = () => {
    const { width, height } = useWindowSize();
    const animationControls = useAnimationControls();

    useEffect(() => {
        let isMounted = true;

        const sequence = async () => {
            if (!isMounted) return;

            // Animate IN from left-to-right
            await animationControls.start(i => ({
                scale: 1,
                opacity: 1,
                transition: {
                    delay: (i.col * 0.025) + (i.row * 0.015),
                    type: 'spring', stiffness: 200, damping: 18,
                }
            }));
            
            if (!isMounted) return;
            await new Promise(resolve => setTimeout(resolve, 150)); // Pause while full

            if (!isMounted) return;
            // Animate OUT from left-to-right
            await animationControls.start(i => ({
                scale: 0,
                opacity: 0,
                transition: {
                    delay: (i.col * 0.025) + (i.row * 0.015),
                    duration: 0.2, ease: 'easeIn'
                }
            }));
            
            if (!isMounted) return;
            await new Promise(resolve => setTimeout(resolve, 150)); // Pause while empty

            sequence(); // Loop the animation
        };

        sequence();

        return () => {
            isMounted = false;
            animationControls.stop();
        };
    }, [animationControls]);

    const grid = useMemo(() => {
        if (width > 0 && height > 0) {
            const hexWidthWithMargin = HEXAGON_SIZE + (HEXAGON_MARGIN * 2);
            const hexHeightWithMargin = (HEXAGON_SIZE * 0.866) + (HEXAGON_MARGIN * 2);
            
            const cols = Math.ceil(width / (hexWidthWithMargin * 0.75));
            const rows = Math.ceil(height / hexHeightWithMargin);
            
            return { rows: rows + 2, cols: cols + 2 };
        }
        return { rows: 0, cols: 0 };
    }, [width, height]);

    // FIX: Explicitly type containerVariants with the Variants type from framer-motion to resolve type errors.
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.5,
                ease: 'easeInOut'
            }
        }
    };

    return (
        <motion.div
            className="hexagon-grid-container"
            key="hexagon-loader"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="hexagon-grid">
                {Array.from({ length: grid.rows }).map((_, rowIndex) => (
                    <div 
                        className="hexagon-row"
                        key={rowIndex} 
                        style={{ marginLeft: rowIndex % 2 === 1 ? `${(HEXAGON_SIZE / 2) + HEXAGON_MARGIN}px` : '0px' }}
                    >
                        {Array.from({ length: grid.cols }).map((_, colIndex) => (
                           <Hexagon 
                                key={`${rowIndex}-${colIndex}`} 
                                animationControls={animationControls} 
                                rowIndex={rowIndex} 
                                colIndex={colIndex} 
                            />
                        ))}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default HexagonLoader;