import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Animated Button component with 3D Depth & Mouse Tracking
 * 
 * Comes forward towards the screen and tilts dynamically as mouse moves over it,
 * and smoothly retreats back into place when mouse leaves.
 */
export const Button = ({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'liquid' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber'
  size = 'md', // 'sm' | 'md' | 'lg' | 'icon'
  disabled = false,
  loading = false,
  className = '',
  leftIcon,
  rightIcon,
  type = 'button',
  title,
  'aria-label': ariaLabel,
  ...rest
}) => {
  // 3D Motion values for mouse movement tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const isHovered = useMotionValue(0);

  const springConfig = { stiffness: 450, damping: 22 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);
  const hoverSpring = useSpring(isHovered, springConfig);

  // 3D Depth and tilt transformations
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg']);
  const translateY = useTransform(hoverSpring, [0, 1], ['0px', '-3.5px']);
  const scale = useTransform(hoverSpring, [0, 1], [1, 1.035]);

  const handleMouseMove = (e) => {
    if (disabled || loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
    isHovered.set(1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    isHovered.set(0);
  };

  // Base styling adhering to the design system with 3D preservation
  const baseClasses =
    'relative inline-flex items-center justify-center font-semibold rounded-full transition-colors cursor-pointer select-none overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-900/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none perspective-1000';

  // Glassy lit-edge variant styling matching ThreeUI design
  const variantClasses = {
    primary:
      'bg-forest-900 hover:bg-forest-950 text-white shadow-[0_6px_20px_rgba(19,53,34,0.32),inset_0_1.5px_1px_rgba(255,255,255,0.35)] border border-forest-800/60 backdrop-blur-xs dark:bg-[#1F4D33] dark:hover:bg-[#276241]',
    liquid:
      'liquid-metal-btn text-white',
    secondary:
      'bg-[#E3F2E6]/90 hover:bg-[#D4EBD8] text-forest-900 border border-emerald-300/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_4px_14px_rgba(19,53,34,0.1)] backdrop-blur-xs dark:bg-emerald-950/60 dark:hover:bg-emerald-900/70 dark:text-emerald-300 dark:border-emerald-800/40',
    outline:
      'border-2 border-[#D6CFC3] hover:border-charcoal bg-white/40 hover:bg-white/70 backdrop-blur-xs text-charcoal shadow-xs dark:border-[#3A4E3D] dark:hover:border-white/40 dark:text-[#F8FAF9] dark:hover:bg-white/10',
    ghost:
      'bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-charcoal/80 dark:text-stone-300 hover:text-charcoal dark:hover:text-white',
    danger:
      'bg-rose-50/90 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] backdrop-blur-xs dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800/40',
    amber:
      'bg-amber-400 hover:bg-amber-500 text-stone-900 shadow-[0_4px_16px_rgba(245,158,11,0.3),inset_0_1px_1px_rgba(255,255,255,0.6)] border border-amber-500/40',
  };

  // Size specifications
  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5',
    icon: 'p-2.5 w-10 h-10',
  };

  return (
    <motion.button
      type={type}
      data-spec=""
      onClick={disabled || loading ? undefined : onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      title={title}
      aria-label={ariaLabel || title}
      style={{
        rotateX,
        rotateY,
        translateY,
        scale,
        transformStyle: 'preserve-3d',
      }}
      whileTap={disabled || loading ? {} : { scale: 0.96, translateY: '0px' }}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      {...rest}
    >
      {/* Subtle shine highlight on hover */}
      <motion.div
        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none -translate-x-full"
        whileHover={{
          translateX: ['-100%', '100%'],
          transition: { duration: 0.6, ease: 'easeInOut' },
        }}
      />

      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}

      {children && <span>{children}</span>}

      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};
