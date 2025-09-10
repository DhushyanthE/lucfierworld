import { ArrowRight } from "lucide-react";
import React, { useEffect, useRef } from "react";
interface HeroSectionProps {
  onTrySwap: () => void;
}
export function HeroSection({
  onTrySwap
}: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Particle animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const container = containerRef.current;
    if (!container) return;
    let animationFrameId: number;
    let particles: Particle[] = [];
    const resizeCanvas = () => {
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    // Handle resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;

        // Color palette for quantum theme
        const colors = ["rgba(147, 51, 234, 0.7)",
        // Purple
        "rgba(139, 92, 246, 0.7)",
        // Violet
        "rgba(79, 70, 229, 0.7)",
        // Indigo
        "rgba(59, 130, 246, 0.7)" // Blue
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const init = () => {
      particles = [];
      const particleCount = Math.min(100, Math.floor(canvas.width * canvas.height / 10000));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    // Connect particles with lines if they're close enough
    const connect = () => {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.2 - distance / 500})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };
    init();
    animate();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <div ref={containerRef} className="relative max-w-4xl mb-24">
      {/* Particle canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 -z-10" style={{
      pointerEvents: 'none'
    }} />
      
      {/* Glowing orb accent */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600/30 rounded-full filter blur-3xl opacity-50 animate-pulse" />
      <div className="absolute top-1/2 -right-20 w-60 h-60 bg-blue-600/20 rounded-full filter blur-3xl opacity-40 animate-pulse" style={{
      animationDuration: '7s'
    }} />
      
      <h1 className="text-6xl font-bold text-white mb-8 leading-tight animate-fade-in relative">
        Quantum-Secured
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 animate-gradient">
          Financial Revolution
        </span>
        <div className="absolute -z-10 top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent"></div>
      </h1>
      
      <p className="text-xl text-gray-300 mb-10 max-w-2xl animate-fade-in" style={{
      animationDelay: '0.2s'
    }}>
        Harness the power of quantum-resistant cryptography with Quantum Coin's next-generation blockchain platform, 
        powering the future of cross-border payments and decentralized finance with unprecedented security.
      </p>
      
      <div className="flex gap-6 animate-fade-in" style={{
      animationDelay: '0.4s'
    }}>
        <button className="quantum-button px-8 py-4 rounded-lg text-white font-medium flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-purple-700/20 hover:shadow-purple-700/40 group">
          Technical Whitepaper 
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
        <button onClick={onTrySwap} className="px-8 py-4 rounded-lg text-white font-medium bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40 shadow-lg shadow-purple-900/5 hover:shadow-purple-900/20">
          Try QuantumSwap
        </button>
      </div>
      
      {/* Stats floating badges */}
      
      
      <style>
        {`
          @keyframes animate-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: animate-gradient 5s ease infinite;
          }
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            opacity: 0;
            animation: fade-in 0.8s ease-out forwards;
          }
        `}
      </style>
    </div>;
}