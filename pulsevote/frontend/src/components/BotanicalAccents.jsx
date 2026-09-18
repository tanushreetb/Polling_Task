import React from 'react';

// Leaf Sprig Accent
export const LeafSprig = ({ className = "w-12 h-12 text-forest-800" }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
    <path d="M50,90 Q48,60 52,30 Q54,15 50,5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Leaves left */}
    <path d="M51,75 C35,70 30,55 42,48 C50,44 51,60 51,75 Z" opacity="0.85" />
    <path d="M51,45 C35,40 32,25 44,20 C50,18 51,32 51,45 Z" opacity="0.85" />
    {/* Leaves right */}
    <path d="M51,60 C65,55 70,40 58,35 C50,32 51,48 51,60 Z" opacity="0.85" />
    <path d="M50,30 C64,25 66,12 55,8 C48,6 50,20 50,30 Z" opacity="0.85" />
  </svg>
);

// Potted Desk Plant SVG matching Hero illustration
export const DeskPlant = ({ className = "w-20 h-28" }) => (
  <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Pot */}
    <path d="M35 110 L42 150 C43 153 46 155 50 155 L70 155 C74 155 77 153 78 150 L85 110 Z" fill="#EADCC9" stroke="#1A1D1A" strokeWidth="2.5" />
    <path d="M30 105 H90 V112 H30 Z" fill="#E2D0B9" stroke="#1A1D1A" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Stems & Leaves */}
    <path d="M60 105 Q60 50 58 20" stroke="#1A1D1A" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M60 70 Q40 60 25 45 C35 30 50 45 60 65" fill="#2E6F40" stroke="#1A1D1A" strokeWidth="2" />
    <path d="M60 85 Q80 70 95 55 C85 40 70 55 60 80" fill="#3B8B52" stroke="#1A1D1A" strokeWidth="2" />
    <path d="M58 40 Q45 25 35 10 C50 5 60 20 58 35" fill="#2E6F40" stroke="#1A1D1A" strokeWidth="2" />
    <path d="M58 30 Q70 20 80 5 C75 -2 60 8 58 25" fill="#3B8B52" stroke="#1A1D1A" strokeWidth="2" />
  </svg>
);

// Hand-drawn Lightbulb doodle
export const LightbulbDoodle = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 50 50" fill="none" stroke="#1A1D1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M25 5 C17 5 12 11 12 18 C12 23 15 26 17 29 L17 35 L33 35 L33 29 C35 26 38 23 38 18 C38 11 33 5 25 5 Z" fill="#FFE066" fillOpacity="0.4" />
    <path d="M19 40 H31" />
    <path d="M21 44 H29" />
    {/* Rays */}
    <path d="M25 0 V2" strokeWidth="2.5" />
    <path d="M7 10 L9 12" strokeWidth="2" />
    <path d="M43 10 L41 12" strokeWidth="2" />
  </svg>
);

// Pulse Waveform Logo Icon
export const PulseWaveIcon = ({ className = "w-6 h-6 text-forest-900" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 16h4l3-8 5 17 4-13 3 7 4-3h3" />
  </svg>
);
