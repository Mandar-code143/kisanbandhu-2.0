/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

export default function GlowEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" id="ambient-glow-container">
      {/* Background radial gradient blobs */}
      <div 
        className="animate-blob-slow-1 absolute -top-40 -left-40 h-[450px] w-[450px] rounded-full bg-primary-500/5 blur-[120px]" 
        id="blob-1"
      />
      <div 
        className="animate-blob-slow-2 absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-accent-500/4 blur-[130px]" 
        id="blob-2"
      />
      <div 
        className="animate-blob-slow-3 absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-primary-400/5 blur-[100px]" 
        id="blob-3"
      />

      {/* Intuitively track user cursor with soft glow */}
      {isHovering && (
        <div
          className="transition-opacity duration-500 ease-out"
          style={{
            position: 'fixed',
            left: mousePosition.x - 175,
            top: mousePosition.y - 175,
            width: '350px',
            height: '350px',
            borderRadius: '100%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(245,158,11,0.03) 50%, transparent 100%)',
            filter: 'blur(30px)',
            opacity: 1,
            pointerEvents: 'none',
          }}
          id="cursor-tracking-neon"
        />
      )}
    </div>
  );
}
