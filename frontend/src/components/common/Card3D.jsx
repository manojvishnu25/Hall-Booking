import React, { useRef, useState } from 'react';

export default function Card3D({ children, className = '', glowColor = 'blue', depth = 15 }) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({ transform: 'rotateX(0deg) rotateY(0deg) translateZ(0px)' });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -depth;
    const rotateY = ((x - centerX) / centerX) * depth;

    // Set mouse variables for CSS specular glow
    cardRef.current.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    cardRef.current.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`,
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
    });
  };

  const glowClass =
    glowColor === 'gold'
      ? 'hover:border-amber-400/50 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.3)]'
      : glowColor === 'purple'
      ? 'hover:border-purple-500/50 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)]'
      : glowColor === 'emerald'
      ? 'hover:border-emerald-500/50 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)]'
      : 'hover:border-blue-500/50 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.35)]';

  return (
    <div className="card-3d-wrapper">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={style}
        className={`card-3d glass-card rounded-3xl p-6 transition-all duration-300 border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl ${glowClass} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
