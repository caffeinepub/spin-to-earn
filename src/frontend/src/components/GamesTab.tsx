import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import JackpotGame from "./games/JackpotGame";
import LuckyWinnerGame from "./games/LuckyWinnerGame";
import ScratchCardGame from "./games/ScratchCardGame";
import SpinWheelGame from "./games/SpinWheelGame";

interface GameCardConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  iconBg: string;
  darkText: boolean;
}

const GAMES: GameCardConfig[] = [
  {
    id: "spin",
    name: "Spin to Earn",
    description: "Spin the wheel and win up to 500 pts!",
    icon: "🎰",
    gradient: "linear-gradient(135deg, #FFF1C9, #F6D24A)",
    iconBg: "#F39A2E",
    darkText: true,
  },
  {
    id: "scratch",
    name: "Scratch Card",
    description: "Scratch 3 spots to reveal your prize!",
    icon: "🎴",
    gradient: "linear-gradient(135deg, #e3f2fd, #90caf9)",
    iconBg: "#2196F3",
    darkText: true,
  },
  {
    id: "lucky",
    name: "Lucky Winner",
    description: "Draw 5 lucky numbers and win big!",
    icon: "🏆",
    gradient: "linear-gradient(135deg, #f3e5f5, #ce93d8)",
    iconBg: "#9C27B0",
    darkText: true,
  },
  {
    id: "jackpot",
    name: "Jackpot Slots",
    description: "Match all 3 symbols for a jackpot!",
    icon: "💎",
    gradient: "linear-gradient(135deg, #1a1a2e, #16213e)",
    iconBg: "#F6D24A",
    darkText: false,
  },
];

interface Props {
  currentPoints: bigint;
  onPointsUpdate: (newPoints: bigint) => void;
}

export default function GamesTab({ currentPoints, onPointsUpdate }: Props) {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [, forceUpdate] = useState(0);

  // Tick every second for cooldown display
  useState(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  });

  const getCooldownRemaining = (gameId: string): number => {
    const endTime = cooldowns[gameId];
    if (!endTime) return 0;
    return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
  };

  const handleCooldown = (gameId: string, endTime: number) => {
    setCooldowns((prev) => ({ ...prev, [gameId]: endTime }));
    setTimeout(() => {
      setCooldowns((prev) => {
        const next = { ...prev };
        delete next[gameId];
        return next;
      });
    }, 60000);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((game) => {
          const cooldown = getCooldownRemaining(game.id);
          const onCooldown = cooldown > 0;
          return (
            <div
              key={game.id}
              data-ocid="games.card"
              className="rounded-3xl overflow-hidden shadow-card"
              style={{ background: game.gradient }}
            >
              <div className="p-4 flex flex-col gap-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
                  style={{ background: game.iconBg }}
                >
                  {game.icon}
                </div>
                <p
                  className="font-bold text-sm"
                  style={{ color: game.darkText ? "#111" : "#F6D24A" }}
                >
                  {game.name}
                </p>
                <p
                  className="text-xs leading-snug"
                  style={{ color: game.darkText ? "#555" : "#ccc" }}
                >
                  {game.description}
                </p>
                <button
                  type="button"
                  data-ocid={`games.${game.id}.button`}
                  className="mt-1 rounded-xl py-1.5 text-xs font-bold text-white transition-opacity"
                  style={{
                    background: onCooldown
                      ? "#999"
                      : "linear-gradient(135deg, #F39A2E, #e8831f)",
                    cursor: onCooldown ? "not-allowed" : "pointer",
                  }}
                  disabled={onCooldown}
                  onClick={() => !onCooldown && setActiveGame(game.id)}
                >
                  {onCooldown ? `⏱ ${cooldown}s` : "▶ Play"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {GAMES.map((game) => (
        <Dialog
          key={game.id}
          open={activeGame === game.id}
          onOpenChange={(open) => !open && setActiveGame(null)}
        >
          <DialogContent
            className="rounded-3xl max-w-sm mx-auto"
            data-ocid={`${game.id}.dialog`}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{game.icon}</span>
                <span>{game.name}</span>
              </DialogTitle>
            </DialogHeader>
            {game.id === "spin" && (
              <SpinWheelGame
                currentPoints={currentPoints}
                onPointsUpdate={(pts) => {
                  onPointsUpdate(pts);
                  setActiveGame(null);
                  handleCooldown("spin", Date.now() + 60000);
                }}
                onCooldown={(t) => handleCooldown("spin", t)}
              />
            )}
            {game.id === "scratch" && (
              <ScratchCardGame
                currentPoints={currentPoints}
                onPointsUpdate={(pts) => {
                  onPointsUpdate(pts);
                  handleCooldown("scratch", Date.now() + 60000);
                }}
                onCooldown={(t) => handleCooldown("scratch", t)}
              />
            )}
            {game.id === "lucky" && (
              <LuckyWinnerGame
                currentPoints={currentPoints}
                onPointsUpdate={(pts) => {
                  onPointsUpdate(pts);
                  handleCooldown("lucky", Date.now() + 60000);
                }}
                onCooldown={(t) => handleCooldown("lucky", t)}
              />
            )}
            {game.id === "jackpot" && (
              <JackpotGame
                currentPoints={currentPoints}
                onPointsUpdate={(pts) => {
                  onPointsUpdate(pts);
                  handleCooldown("jackpot", Date.now() + 60000);
                }}
                onCooldown={(t) => handleCooldown("jackpot", t)}
              />
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
