import React, { useEffect, useRef, useState } from 'react';

export default function Background3DCanvas({ mode = 'gold_campus' }) {
  const canvasRef = useRef(null);
  const activeModeRef = useRef(mode);

  useEffect(() => {
    activeModeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 1. Particle constellation nodes
    const particleCount = Math.min(Math.floor(width / 25), 50);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 0.5,
        radius: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        hue: Math.random() > 0.5 ? 40 : 215, // Amber / Blue
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    // 2. Cyber Grid lines setup
    let gridOffset = 0;

    // 3. Floating 3D Orbs setup
    const orbs = [
      { x: width * 0.2, y: height * 0.3, vx: 0.3, vy: 0.2, radius: 250, color: 'rgba(245, 158, 11, 0.08)' },
      { x: width * 0.8, y: height * 0.6, vx: -0.2, vy: 0.3, radius: 300, color: 'rgba(59, 130, 246, 0.08)' },
      { x: width * 0.5, y: height * 0.8, vx: 0.2, vy: -0.2, radius: 280, color: 'rgba(168, 85, 247, 0.07)' }
    ];

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const currentMode = activeModeRef.current;

      // MODE 1: Golden Campus Emblem Glow (Jai Shriram Theme)
      if (currentMode === 'gold_campus') {
        // Ambient background gradient - Brighter Navy & Slate Base
        const bgGrad = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 2, width);
        bgGrad.addColorStop(0, '#1c2842');
        bgGrad.addColorStop(0.5, '#121b2f');
        bgGrad.addColorStop(1, '#0b1120');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Golden mouse spotlight
        const spot = ctx.createRadialGradient(mouseX, mouseY, 20, mouseX, mouseY, 550);
        spot.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
        spot.addColorStop(0.5, 'rgba(59, 130, 246, 0.12)');
        spot.addColorStop(1, 'transparent');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, width, height);

        // Render golden ember sparks floating up
        particles.forEach(p => {
          p.y -= 0.3 * p.z;
          if (p.y < 0) p.y = height;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${Math.min(1, p.alpha * 1.4)})`;
          ctx.shadowBlur = 18;
          ctx.shadowColor = `hsla(${p.hue}, 95%, 65%, 0.7)`;
          ctx.fill();
        });
      }

      // MODE 2: Futuristic Cyberpunk 3D Wireframe Grid
      else if (currentMode === 'cyber_grid') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        gridOffset = (gridOffset + 0.5) % 40;

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.28)';
        ctx.lineWidth = 1.2;

        // Perspective 3D Grid lines vanishing to center
        const horizon = height * 0.45;
        const centerX = width / 2;

        // Vertical perspective lines
        for (let x = -width; x < width * 2; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, height);
          ctx.lineTo(centerX + (x - centerX) * 0.1, horizon);
          ctx.stroke();
        }

        // Horizontal perspective lines moving down
        for (let y = horizon; y < height; y += 20 + (y - horizon) * 0.1) {
          const adjustedY = y + (gridOffset * (y - horizon)) / 200;
          if (adjustedY < height) {
            ctx.beginPath();
            ctx.moveTo(0, adjustedY);
            ctx.lineTo(width, adjustedY);
            ctx.stroke();
          }
        }

        // Laser scan line
        const scanY = (Date.now() / 15) % height;
        const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
        scanGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 20, width, 40);
      }

      // MODE 3: Nebula Cosmic Gradient Mesh
      else if (currentMode === 'nebula_flow') {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, width, height);

        const vibrantOrbs = [
          { x: width * 0.2, y: height * 0.3, vx: 0.3, vy: 0.2, radius: 280, color: 'rgba(245, 158, 11, 0.18)' },
          { x: width * 0.8, y: height * 0.6, vx: -0.2, vy: 0.3, radius: 320, color: 'rgba(59, 130, 246, 0.2)' },
          { x: width * 0.5, y: height * 0.8, vx: 0.2, vy: -0.2, radius: 300, color: 'rgba(168, 85, 247, 0.18)' }
        ];

        vibrantOrbs.forEach(orb => {
          orb.x += orb.vx;
          orb.y += orb.vy;
          if (orb.x < 0 || orb.x > width) orb.vx *= -1;
          if (orb.y < 0 || orb.y > height) orb.vy *= -1;

          const g = ctx.createRadialGradient(orb.x, orb.y, 10, orb.x, orb.y, orb.radius);
          g.addColorStop(0, orb.color);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // MODE 4: Constellation Node Network
      else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        particles.forEach((p, i) => {
          p.x += p.vx * p.z;
          p.y += p.vy * p.z;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(147, 197, 253, ${Math.min(1, p.alpha * 1.5)})`;
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 130) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(99, 102, 241, ${0.32 * (1 - dist / 130)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-90 transition-all duration-700"
    />
  );
}
