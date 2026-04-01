import { Button } from "@/components/ui/button";
import { useJackpot } from "@/hooks/useQueries";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SYMBOLS = ["🍌", "🍊", "🍇", "💎", "🍀", "🎰", "⭐", "🔔"];
const REEL_IDS = ["reel-0", "reel-1", "reel-2"] as const;

interface Props {
  currentPoints: bigint;
  onPointsUpdate: (newPoints: bigint) => void;
  onCooldown: (endTime: number) => void;
}

export default function JackpotGame({
  currentPoints,
  onPointsUpdate,
  onCooldown,
}: Props) {
  const [reels, setReels] = useState(["🍌", "🍊", "🍇"]);
  const [spinning, setSpinning] = useState([false, false, false]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const jackpotMutation = useJackpot();
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const clearAllIntervals = () => {
    for (const id of intervalsRef.current) clearInterval(id);
    intervalsRef.current = [];
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: cleanup only
  useEffect(() => () => clearAllIntervals(), []);

  const handleSpin = () => {
    if (isSpinning) return;
    clearAllIntervals();
    setIsSpinning(true);
    setResult(null);
    setSpinning([true, true, true]);
    const finalSymbols = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ];
    const stopTimes = [1200, 2000, 3000];
    for (const ri of [0, 1, 2] as const) {
      const interval = setInterval(() => {
        setReels((prev) => {
          const next = [...prev];
          next[ri] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          return next;
        });
      }, 80);
      intervalsRef.current.push(interval);
      setTimeout(() => {
        clearInterval(interval);
        setReels((prev) => {
          const next = [...prev];
          next[ri] = finalSymbols[ri];
          return next;
        });
        setSpinning((prev) => {
          const next = [...prev];
          next[ri] = false;
          return next;
        });
        if (ri === 2) {
          setIsSpinning(false);
          const isJackpot =
            finalSymbols[0] === finalSymbols[1] &&
            finalSymbols[1] === finalSymbols[2];
          const isTwoMatch =
            finalSymbols[0] === finalSymbols[1] ||
            finalSymbols[1] === finalSymbols[2];
          // Determine prize locally
          const prize = isJackpot ? 500 : isTwoMatch ? 50 : 5;
          if (isJackpot) setResult("🎉 JACKPOT! +500 pts");
          else if (isTwoMatch) setResult("✨ 2 match! +50 pts");
          else setResult("😅 Try again! +5 pts");
          // Pass only the WON points delta
          jackpotMutation.mutate(BigInt(prize), {
            onSuccess: (newPoints) => {
              onPointsUpdate(newPoints);
              onCooldown(Date.now() + 60000);
              if (isJackpot) toast.success("🎰 JACKPOT!! +500 pts!");
              else toast.success(`🎰 Spin complete! +${prize} pts`);
            },
            onError: () => {
              onPointsUpdate(currentPoints + BigInt(prize));
              onCooldown(Date.now() + 60000);
              if (isJackpot) toast.success("🎰 JACKPOT!! +500 pts!");
              else toast.success(`🎰 Spin complete! +${prize} pts`);
            },
          });
        }
      }, stopTimes[ri]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 p-2">
      <div
        className="w-full rounded-3xl p-5 shadow-card"
        style={{
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          border: "3px solid #F6D24A",
        }}
      >
        <p className="text-center text-yellow-300 font-bold mb-4 text-sm">
          🎰 JACKPOT SLOTS
        </p>
        <div className="flex gap-3 justify-center">
          {reels.map((symbol, i) => (
            <div
              key={REEL_IDS[i]}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
              style={{
                background: "linear-gradient(135deg, #2d3748, #4a5568)",
                border: "2px solid #F6D24A",
                opacity: spinning[i] ? 0.8 : 1,
                transition: spinning[i] ? "none" : "opacity 0.3s",
              }}
            >
              {symbol}
            </div>
          ))}
        </div>
        <div
          className="mt-3 h-1 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #F6D24A, transparent)",
          }}
        />
      </div>
      {result && (
        <div className="text-center scratch-reveal">
          <p
            className="text-xl font-bold"
            style={{
              color: result.includes("JACKPOT")
                ? "#F6D24A"
                : result.includes("match")
                  ? "#4CAF50"
                  : "#aaa",
            }}
          >
            {result}
          </p>
        </div>
      )}
      <Button
        data-ocid="jackpot.primary_button"
        onClick={handleSpin}
        disabled={isSpinning || jackpotMutation.isPending}
        className="w-full rounded-2xl font-bold text-lg py-6"
        style={{
          background: "linear-gradient(135deg, #F6D24A, #F39A2E)",
          color: "#1a1a2e",
        }}
      >
        {isSpinning ? "Spinning..." : "🎰 PULL!"}
      </Button>
    </div>
  );
}
