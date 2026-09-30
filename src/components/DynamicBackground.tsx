import React, { useEffect, useRef } from 'react';

interface DynamicBackgroundProps {
  showScanlines?: boolean;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ showScanlines = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for neural synapse network
    const particleCount = Math.min(45, Math.floor(width / 35));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.8 + 1,
      alpha: Math.random() * 0.4 + 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Scanning laser beam
    let laserY = 0;
    const laserSpeed = 0.85;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle radial gradient background illumination
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.25,
        50,
        width * 0.5,
        height * 0.25,
        Math.max(width, height) * 0.7
      );
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
      grad.addColorStop(0.5, 'rgba(15, 23, 42, 0)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Medical scanner laser sweep line
      laserY += laserSpeed;
      if (laserY > height) laserY = -20;
      const laserGrad = ctx.createLinearGradient(0, laserY - 15, 0, laserY + 15);
      laserGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      laserGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.07)');
      laserGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = laserGrad;
      ctx.fillRect(0, laserY - 15, width, 30);

      // 3. Connect particles with neural synapses
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.14;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // 4. Draw glowing neural nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${Math.max(0.05, currentAlpha)})`;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Dynamic Animated Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-80"
        aria-hidden="true"
      />

      {/* Subtle CRT Scanline overlay pattern */}
      {showScanlines && (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.035] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"
          aria-hidden="true"
        />
      )}
    </>
  );
};
