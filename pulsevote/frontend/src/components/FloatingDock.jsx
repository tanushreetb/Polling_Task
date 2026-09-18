import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Animated Dock Item with 3D Depth on Mouse Movement
 * Smoothly comes forward (Z-axis lift & scale) as mouse moves over it,
 * and goes back to resting state when mouse leaves.
 */
const DockItem = ({ id, label, icon, isActive, isEnter, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const isHovered = useMotionValue(0);

  const springConfig = { stiffness: 450, damping: 24 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);
  const hoverSpring = useSpring(isHovered, springConfig);

  // 3D tilt and forward travel
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);
  const translateY = useTransform(hoverSpring, [0, 1], ['0px', '-5px']);
  const scale = useTransform(hoverSpring, [0, 1], [1, 1.08]);

  const handleMouseMove = (e) => {
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

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-spec=""
      style={{
        rotateX,
        rotateY,
        translateY,
        scale,
        transformStyle: 'preserve-3d',
      }}
      whileTap={{ scale: 0.95 }}
      className={`dock-item ${isActive ? 'is-active' : ''} ${isEnter ? 'dock-item--enter' : ''}`}
    >
      <span className="glyph" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </motion.button>
  );
};

/**
 * ThreeUI Sylva Floating Glass Dock Navigation
 * - Removed the left tree mark button as requested
 * - Each item moves forward in 3D and retreats according to mouse movement
 */
export const FloatingDock = ({ currentView, setView, onOpenCreate, showAllScreens = false, className = '' }) => {
  const baseItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 14V9" />
          <path d="M8 9c0-2.4 1.7-4.3 4-4.3.2 2.6-1.6 4.6-4 4.3Z" />
          <path d="M8 10.5C7.9 8.4 6.4 6.8 4.4 6.8 4.3 8.9 5.9 10.6 8 10.5Z" />
        </svg>
      ),
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.6 12.4c2.4-3.4 4.3-5.1 5.7-5.1 2 0 3 3.6 5 3.6 1.1 0 1.9-.5 2.4-1.4" />
          <path d="M4.3 6.2C5.5 4.4 6.6 3.5 7.6 3.5c1.5 0 2.2 2.4 3.7 2.4" />
        </svg>
      ),
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 2.4h5.3L12 5.1v8.5H4z" />
          <path d="M9.2 2.4V5h2.7" />
          <path d="M6 8.4h4M6 10.8h2.8" />
        </svg>
      ),
    },
  ];

  const extraItems = showAllScreens
    ? [
        {
          id: 'vote',
          label: 'Vote',
          icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="6" /><path d="M8 5v6M5 8h6" /></svg>
          ),
        },
        {
          id: 'results',
          label: 'Results',
          icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 14h12M4 11v-3M8 11V5M12 11V8" /></svg>
          ),
        },
      ]
    : [];

  const navItems = [...baseItems, ...extraItems];

  return (
    <div className={`dock-wrap ${className}`}>
      <nav
        className="dock perspective-1000"
        data-spec=""
        aria-label="Sylva Floating Navigation"
      >
        {/* Navigation Items (tree button removed) */}
        {navItems.map((item) => (
          <DockItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={currentView === item.id}
            isEnter={false}
            onClick={() => setView(item.id)}
          />
        ))}

        {/* Right CTA / Enter Button */}
        <DockItem
          id="create"
          label="Create"
          icon={
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.6 2.5h5.1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6.6" />
              <path d="M2.6 8h6.6" />
              <path d="m7 5.6 2.4 2.4L7 10.4" />
            </svg>
          }
          isActive={currentView === 'create'}
          isEnter={true}
          onClick={onOpenCreate || (() => setView('create'))}
        />
      </nav>
    </div>
  );
};
