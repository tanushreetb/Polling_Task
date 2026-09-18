import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * ThreeUI Sylva Ambient Motes & Drifting Pollen Particles
 * 
 * Renders lightweight floating particles inspired by the Sylva living-green scene,
 * drifting smoothly across the background to give the UI a living 3D atmosphere.
 */
export const AmbientMotes = ({ count = 18 }) => {
  const motes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2, // 2px to 6px
      duration: Math.random() * 10 + 12, // 12s to 22s
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.15,
      driftX: (Math.random() - 0.5) * 60,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {motes.map((mote) => (
        <motion.div
          key={mote.id}
          className="absolute rounded-full bg-emerald-600/30 dark:bg-emerald-400/40 blur-[0.5px]"
          style={{
            left: mote.x,
            top: mote.y,
            width: mote.size,
            height: mote.size,
          }}
          animate={{
            y: [0, -70, -140, 0],
            x: [0, mote.driftX, -mote.driftX * 0.5, 0],
            opacity: [mote.opacity, mote.opacity * 1.6, mote.opacity * 0.4, mote.opacity],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: mote.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: mote.delay,
          }}
        />
      ))}
    </div>
  );
};
