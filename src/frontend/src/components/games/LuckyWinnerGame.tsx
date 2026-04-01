import { Button } from "@/components/ui/button";
import { useLuckyWinner } from "@/hooks/useQueries";
import { useState } from "react";
import { toast } from "sonner";

const PRIZE_TABLE = [500, 300, 200, 150, 100, 75, 50, 25];

interface Props {
  currentPoints: bigint;
  onPointsUpdate: (newPoints: bigint) => void;
  onCooldown: (endTime: number) => void;
}

interface DrawnBall {
  num: number;
  uid: string;
}

export default function LuckyWinnerGame({
  currentPoints,
  onPointsUpdate,
  onCooldown,
}: Props) {
  const [drawnBalls, setDrawnBalls] = useState<DrawnBall[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const luckyMutation = useLuckyWinner();

  const handleDraw = async () => {
    if (isDrawing) return;
    setIsDrawing(true);
    setDrawnBalls([]);
    setResult(null);
    const numbers: number[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 400));
      let num: number;
      do {
        num = Math.floor(Math.random() * 50) + 1;
      } while (numbers.includes(num));
      numbers.push(num);
      const uid = `${num}-pos${i}-${Date.now()}`;
      setDrawnBalls((prev) => [...prev, { num, uid }]);
    }
    setIsDrawing(false);
    // Determine prize based on sum of drawn numbers
    const sum = numbers.reduce((a, b) => a + b, 0);
    const prizeIndex = Math.floor((sum / (50 * 5)) * PRIZE_TABLE.length);
    const prize = PRIZE_TABLE[Math.min(prizeIndex, PRIZE_TABLE.length - 1)];
    setResult(`You won ${prize} points!`);
    // Pass only the WON points delta
    luckyMutation.mutate(BigInt(prize), {
      onSuccess: (newPoints) => {
        onPointsUpdate(newPoints);
        onCooldown(Date.now() + 60000);
        toast.success(`🏆 Lucky Winner! +${prize} pts`);
      },
      onError: () => {
        onPointsUpdate(currentPoints + BigInt(prize));
        onCooldown(Date.now() + 60000);
        toast.success(`🏆 Lucky Winner! +${prize} pts`);
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-5 p-2">
      <div
        className="w-full rounded-3xl p-4 shadow-card"
        style={{
          background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
          border: "2px solid #2196F3",
        }}
      >
        <p className="text-center text-sm font-semibold mb-3 text-blue-800">
          🎱 Lucky Number Draw (1–50)
        </p>
        <div className="flex flex-wrap justify-center gap-2 min-h-[80px] items-center">
          {drawnBalls.length === 0 && !isDrawing && (
            <p className="text-muted-foreground text-sm">
              Press Draw to start!
            </p>
          )}
          {drawnBalls.map((ball) => (
            <div
              key={ball.uid}
              className="ball-pop w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-card"
              style={{ background: `hsl(${(ball.num * 7) % 360}, 70%, 55%)` }}
            >
              {ball.num}
            </div>
          ))}
          {isDrawing && drawnBalls.length < 5 && (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
              ?
            </div>
          )}
        </div>
      </div>
      {result && (
        <div className="text-center scratch-reveal">
          <p className="text-2xl font-bold" style={{ color: "#F39A2E" }}>
            🏆 {result}
          </p>
        </div>
      )}
      <Button
        data-ocid="lucky.primary_button"
        onClick={handleDraw}
        disabled={isDrawing || luckyMutation.isPending}
        className="w-full rounded-2xl text-white font-bold text-lg py-6"
        style={{ background: "linear-gradient(135deg, #2196F3, #1565C0)" }}
      >
        {isDrawing ? "Drawing..." : "🎱 Draw!"}
      </Button>
    </div>
  );
}
