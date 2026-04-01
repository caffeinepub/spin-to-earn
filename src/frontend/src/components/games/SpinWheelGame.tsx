import { Button } from "@/components/ui/button";
import { useSpinWheel } from "@/hooks/useQueries";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SEGMENTS = [
  { label: "10 pts", points: 10, color: "#F6D24A" },
  { label: "25 pts", points: 25, color: "#F39A2E" },
  { label: "50 pts", points: 50, color: "#4CAF50" },
  { label: "100 pts", points: 100, color: "#2196F3" },
  { label: "150 pts", points: 150, color: "#9C27B0" },
  { label: "200 pts", points: 200, color: "#F44336" },
  { label: "300 pts", points: 300, color: "#FF9800" },
  { label: "500 pts", points: 500, color: "#00BCD4" },
];

interface Props {
  currentPoints: bigint;
  onPointsUpdate: (newPoints: bigint) => void;
  onCooldown: (endTime: number) => void;
}

export default function SpinWheelGame({
  currentPoints,
  onPointsUpdate,
  onCooldown,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonSegment, setWonSegment] = useState<(typeof SEGMENTS)[0] | null>(
    null,
  );
  const spinMutation = useSpinWheel();
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentRotRef = useRef<number>(0);

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;
    const segAngle = (2 * Math.PI) / SEGMENTS.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const [i, seg] of SEGMENTS.entries()) {
      const startAngle = rot + i * segAngle - Math.PI / 2;
      const endAngle = startAngle + segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(seg.label, r - 10, 4);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#F39A2E";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r + 6, cy);
    ctx.lineTo(cx + r - 10, cy - 10);
    ctx.lineTo(cx + r - 10, cy + 10);
    ctx.closePath();
    ctx.fillStyle = "#F39A2E";
    ctx.fill();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: draw once on mount
  useEffect(() => {
    drawWheel(0);
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonSegment(null);
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomSegment = Math.floor(Math.random() * SEGMENTS.length);
    const segAngle = (2 * Math.PI) / SEGMENTS.length;
    const targetAngle = extraSpins * 2 * Math.PI + randomSegment * segAngle;
    const startRot = currentRotRef.current;
    startTimeRef.current = performance.now();
    const duration = 3000;
    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      const rot = startRot + targetAngle * eased;
      currentRotRef.current = rot;
      drawWheel(rot);
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const won = SEGMENTS[randomSegment];
        setWonSegment(won);
        // Pass only the WON points delta, not currentPoints
        spinMutation.mutate(BigInt(won.points), {
          onSuccess: (newPoints) => {
            onPointsUpdate(newPoints);
            onCooldown(Date.now() + 60000);
            toast.success(`🎉 You won ${won.points} points!`);
          },
          onError: () => {
            onPointsUpdate(currentPoints + BigInt(won.points));
            onCooldown(Date.now() + 60000);
            toast.success(`🎉 You won ${won.points} points!`);
          },
        });
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          className="drop-shadow-lg"
        />
      </div>
      {wonSegment && (
        <div className="text-center scratch-reveal">
          <p className="text-2xl font-bold" style={{ color: wonSegment.color }}>
            🎉 {wonSegment.label}!
          </p>
        </div>
      )}
      <Button
        data-ocid="spin.primary_button"
        onClick={handleSpin}
        disabled={isSpinning || spinMutation.isPending}
        className="w-full rounded-2xl text-white font-bold text-lg py-6 pulse-glow"
        style={{ background: "linear-gradient(135deg, #F39A2E, #e8831f)" }}
      >
        {isSpinning ? "Spinning..." : "🎰 SPIN!"}
      </Button>
    </div>
  );
}
