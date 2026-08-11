import React, { useEffect, useRef } from 'react';

const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const stars: { x: number; y: number; z: number; pastZ: number }[] = [];
    const numStars = 1500;
    
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        z: Math.random() * 2000,
        pastZ: 0,
      });
    }

    const draw = () => {
      // Create a slight trail effect by not fully clearing the canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        
        star.pastZ = star.z;
        star.z -= 7.5; // Reduced speed by 25%

        // Reset if passed camera
        if (star.z <= 0) {
          star.x = Math.random() * 2000 - 1000;
          star.y = Math.random() * 2000 - 1000;
          star.z = 2000;
          star.pastZ = 2000;
        }

        // Project 3D to 2D
        const px = cx + (star.x / star.z) * width;
        const py = cy + (star.y / star.z) * width;
        
        const pastPx = cx + (star.x / star.pastZ) * width;
        const pastPy = cy + (star.y / star.pastZ) * width;

        // Draw star as a line segment to create a motion blur effect
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - star.z / 2000})`;
          ctx.lineWidth = (1 - star.z / 2000) * 2;
          ctx.moveTo(pastPx, pastPy);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default CosmicBackground;
