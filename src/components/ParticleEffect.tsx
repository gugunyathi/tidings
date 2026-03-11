import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  opacity: number;
}

interface ParticleEffectProps {
  /** "ambient" = slow floating, "burst" = explosion, "rain" = falling */
  mode?: "ambient" | "burst" | "rain";
  /** Burst from this point (for double-tap) */
  burstOrigin?: { x: number; y: number } | null;
  /** Hue base (gold=38, red=0, purple=270) */
  hue?: number;
  /** Number of particles */
  count?: number;
  /** Whether effect is active */
  active?: boolean;
}

const ParticleEffect = ({
  mode = "ambient",
  burstOrigin = null,
  hue = 38,
  count = 30,
  active = true,
}: ParticleEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animFrame = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (p?: Partial<Particle>): Particle => {
      const w = canvas.width;
      const h = canvas.height;

      if (mode === "burst" && burstOrigin) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        return {
          x: burstOrigin.x * (window.devicePixelRatio || 1),
          y: burstOrigin.y * (window.devicePixelRatio || 1),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          size: 2 + Math.random() * 4,
          hue: hue + (Math.random() - 0.5) * 30,
          opacity: 1,
          ...p,
        };
      }

      if (mode === "rain") {
        return {
          x: Math.random() * w,
          y: -10,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 1 + Math.random() * 2,
          life: 0,
          maxLife: 200 + Math.random() * 100,
          size: 1 + Math.random() * 2,
          hue: hue + (Math.random() - 0.5) * 20,
          opacity: 0.3 + Math.random() * 0.4,
          ...p,
        };
      }

      // ambient
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.5,
        life: 0,
        maxLife: 300 + Math.random() * 200,
        size: 1 + Math.random() * 2,
        hue: hue + (Math.random() - 0.5) * 30,
        opacity: 0.15 + Math.random() * 0.25,
        ...p,
      };
    };

    // Init particles
    const burstCount = mode === "burst" ? count : Math.min(count, 20);
    particles.current = Array.from({ length: burstCount }, () => spawn());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const toRemove: number[] = [];

      particles.current.forEach((p, i) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        if (mode === "burst") {
          p.vy += 0.15; // gravity
          p.vx *= 0.98;
        }

        const progress = p.life / p.maxLife;
        const alpha = mode === "burst"
          ? p.opacity * (1 - progress)
          : p.opacity * (progress < 0.1 ? progress * 10 : progress > 0.8 ? (1 - progress) * 5 : 1);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${alpha})`;
        ctx.fill();

        // Glow
        if (alpha > 0.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${alpha * 0.15})`;
          ctx.fill();
        }

        if (p.life >= p.maxLife) {
          toRemove.push(i);
        }
      });

      // Recycle ambient/rain particles
      if (mode !== "burst") {
        toRemove.forEach((i) => {
          particles.current[i] = spawn();
        });
      } else {
        // Remove dead burst particles
        particles.current = particles.current.filter((_, i) => !toRemove.includes(i));
      }

      if (mode === "burst" && particles.current.length === 0) {
        return; // Done
      }

      animFrame.current = requestAnimationFrame(animate);
    };

    animFrame.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, mode, burstOrigin, hue, count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default ParticleEffect;
