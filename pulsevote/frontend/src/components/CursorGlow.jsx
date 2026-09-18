import React, { useEffect, useState } from 'react';

/**
 * Living Green Cursor Tracking Component from ThreeUI / Sylva
 * 
 * Smoothly follows pointer movement, provides ambient living-green pollen glow,
 * and dynamically calculates specular rim angles (--spec-angle, --spec-bright)
 * on buttons and interactive cards.
 */
export const CursorGlow = () => {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  useEffect(() => {
    let animationFrameId;

    const handlePointerMove = (e) => {
      const { clientX, clientY } = e;
      
      if (!visible) setVisible(true);

      // Smooth coordinate update
      setPos({ x: clientX, y: clientY });

      // Calculate specular rim angles for elements marked with [data-spec]
      const specElements = document.querySelectorAll('[data-spec]');
      specElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const dist = Math.hypot(dx, dy);

        // Angle from element center to pointer in degrees
        const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

        // Brightness falls off smoothly within 220px
        const maxDist = 220;
        const brightness = Math.max(0, Math.min(1, 1 - dist / maxDist));

        el.style.setProperty('--spec-angle', `${angleDeg}deg`);
        el.style.setProperty('--spec-bright', brightness.toFixed(2));
      });

      // Detect if hovering an interactive element (button, a, input, [role="button"])
      const target = document.elementFromPoint(clientX, clientY);
      if (target && target.closest('button, a, input, [role="button"], .interactive-card, [data-spec]')) {
        setIsHoveringInteractive(true);
      } else {
        setIsHoveringInteractive(false);
      }
    };

    const handleMouseLeave = () => {
      setVisible(false);
      const specElements = document.querySelectorAll('[data-spec]');
      specElements.forEach((el) => {
        el.style.setProperty('--spec-bright', '0');
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="cursor-glow-light"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: isHoveringInteractive ? '380px' : '480px',
        height: isHoveringInteractive ? '380px' : '480px',
        opacity: visible ? 1 : 0,
      }}
      aria-hidden="true"
    />
  );
};
