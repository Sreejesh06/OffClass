import React, { useEffect, useRef } from 'react';

interface SpaceParticlesProps {
  particleCount?: number;
  speed?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  pz: number;
  color: string;
  size: number;
}

const STAR_COLORS = [
  'rgba(255, 255, 255, ',   // Pure white
  'rgba(224, 231, 255, ',   // Soft starlight blue
  'rgba(6, 182, 212, ',     // Cyber cyan
  'rgba(168, 85, 247, ',    // Cyber purple
];

export const SpaceParticles: React.FC<SpaceParticlesProps> = ({
  particleCount = 180,
  speed = 1.2,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const maxDepth = 1200;
    const focalLength = 300;

    // Initialize 3D particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const z = Math.random() * maxDepth;
      particles.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z,
        pz: z,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        size: Math.random() * 1.8 + 0.6,
      });
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle forward in 3D space
        p.pz = p.z;
        p.z -= speed;

        // Reset particle if it flies past the camera
        if (p.z <= 0) {
          p.z = maxDepth;
          p.pz = maxDepth;
          p.x = (Math.random() - 0.5) * width * 2;
          p.y = (Math.random() - 0.5) * height * 2;
        }

        // 3D Perspective Projection
        const k = focalLength / p.z;
        const px = cx + p.x * k;
        const py = cy + p.y * k;

        // Previous position for subtle motion streak
        const pk = focalLength / p.pz;
        const prevX = cx + p.x * pk;
        const prevY = cy + p.y * pk;

        // Check if inside screen boundaries
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthRatio = 1 - p.z / maxDepth;
          const alpha = Math.min(1, Math.max(0.15, depthRatio * 1.1));
          const currentRadius = Math.max(0.5, p.size * depthRatio * 1.6);

          // Draw subtle motion streak
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `${p.color}${alpha * 0.5})`;
          ctx.lineWidth = currentRadius * 0.8;
          ctx.stroke();

          // Draw star particle
          ctx.beginPath();
          ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.fill();

          // Soft glow on closer particles
          if (depthRatio > 0.65) {
            ctx.beginPath();
            ctx.arc(px, py, currentRadius * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${alpha * 0.2})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
};
