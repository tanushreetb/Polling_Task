import React from 'react';

export const StickyNote = ({
  color = 'yellow', // 'yellow' | 'peach' | 'mint'
  rotate = '-2deg',
  tape = true,
  className = '',
  children,
}) => {
  const colorMap = {
    yellow: 'bg-[#FEF8D3] dark:bg-[#383015] border-[#F0E5A7] dark:border-[#5C4F22] !text-[#261E0A] dark:!text-[#FFF8CC]',
    peach: 'bg-[#FFE7DB] dark:bg-[#3D251C] border-[#F5C7B5] dark:border-[#5E3B2E] !text-[#361A10] dark:!text-[#FFEAE0]',
    mint: 'bg-[#E3F4E7] dark:bg-[#1A3323] border-[#C3E6CA] dark:border-[#284E34] !text-[#132E18] dark:!text-[#E2FBE6]',
  };

  return (
    <div
      style={{ transform: `rotate(${rotate})` }}
      className={`relative p-3.5 sm:p-4 rounded-xl border shadow-sticky sticky-note font-hand text-lg leading-snug select-none ${colorMap[color] || colorMap.yellow} ${className}`}
    >
      {tape && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/70 dark:bg-white/20 backdrop-blur-xs border-t border-b border-dashed border-gray-400/50 shadow-xs" />
      )}
      {children}
    </div>
  );
};
