import { Button } from "@/components/ui/button";
import { useScratchCard } from "@/hooks/useQueries";
import { useState } from "react";
import { toast } from "sonner";

const SCRATCH_SPOTS = [
  { id: 0, reward: "🍌 50 pts", points: 50 },
  { id: 1, reward: "🍊 25 pts", points: 25 },
  { id: 2, reward: "💎 100 pts", points: 100 },
  { id: 3, reward: "⭐ 75 pts", points: 75 },
  { id: 4, reward: "🎉 200 pts", points: 200 },
  { id: 5, reward: "🍀 10 pts", points: 10 },
];

interface Props {
  currentPoints: bigint;
  onPointsUpdate: (newPoints: bigint) => void;
  onCooldown: (endTime: number) => void;
}

export default function ScratchCardGame({
  currentPoints,
  onPointsUpdate,
  onCooldown,
}: Props) {
  const [scratched, setScratched] = useState<Set<number>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [wonPoints, setWonPoints] = useState(0);
  const scratchMutation = useScratchCard();

  const handleScratch = (id: number) => {
    if (gameOver || scratched.has(id)) return;
    const newScratched = new Set(scratched);
    newScratched.add(id);
    setScratched(newScratched);
    if (newScratched.size >= 3 && !gameOver) {
      setGameOver(true);
      const totalWon = Array.from(newScratched).reduce(
        (sum, spotId) =>
          sum + (SCRATCH_SPOTS.find((s) => s.id === spotId)?.points ?? 0),
        0,
      );
      setWonPoints(totalWon);
      setTimeout(() => {
        setRevealed(true);
        // Pass only the WON points delta
        scratchMutation.mutate(BigInt(totalWon), {
          onSuccess: (newPoints) => {
            onPointsUpdate(newPoints);
            onCooldown(Date.now() + 60000);
            toast.success(`🌄 You won ${totalWon} points!`);
          },
          onError: () => {
            onPointsUpdate(currentPoints + BigInt(totalWon));
            onCooldown(Date.now() + 60000);
            toast.success(`🌄 You won ${totalWon} points!`);
          },
        });
      }, 400);
    }
  };

  const resetCard = () => {
    setScratched(new Set());
    setGameOver(false);
    setRevealed(false);
    setWonPoints(0);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-2">
      <div
        className="w-full rounded-3xl p-4 shadow-card"
        style={{
          background: "linear-gradient(135deg, #FFF1C9, #F6D24A)",
          border: "2px solid #F39A2E",
        }}
      >
        <p className="text-center font-bold text-sm mb-3 text-amber-800">
          Scratch 3 spots to reveal your prize! 🌄
        </p>
        <div className="grid grid-cols-3 gap-3">
          {SCRATCH_SPOTS.map((spot) => {
            const isScratched = scratched.has(spot.id);
            return (
              <button
                type="button"
                key={spot.id}
                data-ocid={`scratch.button.${spot.id + 1}`}
                onClick={() => handleScratch(spot.id)}
                className="relative h-20 rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background:
                    isScratched || revealed
                      ? "linear-gradient(135deg, #fff, #f0f8ff)"
                      : "linear-gradient(135deg, #ccc, #999)",
                  transform: isScratched ? "scale(0.95)" : "scale(1)",
                  cursor: isScratched || gameOver ? "default" : "pointer",
                }}
              >
                {isScratched || revealed ? (
                  <div className="flex flex-col items-center justify-center h-full scratch-reveal">
                    <span className="text-2xl">
                      {spot.reward.split(" ")[0]}
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {spot.reward.split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-3xl">❓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {revealed && (
        <div className="text-center scratch-reveal">
          <p className="text-xl font-bold text-primary">
            🎊 +{wonPoints} Points!
          </p>
          <p className="text-sm text-muted-foreground">
            Points added to your account
          </p>
        </div>
      )}
      {!gameOver && (
        <p className="text-sm text-muted-foreground">
          Scratched: {scratched.size}/3
        </p>
      )}
      {revealed && (
        <Button
          data-ocid="scratch.secondary_button"
          onClick={resetCard}
          variant="outline"
          className="w-full rounded-2xl"
        >
          🔄 New Card (on cooldown)
        </Button>
      )}
    </div>
  );
}
