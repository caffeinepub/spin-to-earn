import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import GamesTab from "./components/GamesTab";
import ProfileTab from "./components/ProfileTab";
import SettingsTab from "./components/SettingsTab";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUserProfile } from "./hooks/useQueries";

type Tab = "games" | "profile" | "settings";

export default function App() {
  const { login, isLoggingIn, identity, isInitializing } =
    useInternetIdentity();
  const [activeTab, setActiveTab] = useState<Tab>("games");
  const [theme, setTheme] = useState("light");
  const [points, setPoints] = useState<bigint>(BigInt(0));
  const { data: profile } = useUserProfile();

  useEffect(() => {
    if (profile?.points !== undefined) setPoints(profile.points);
  }, [profile]);

  useEffect(() => {
    if (profile?.settings?.theme) setTheme(profile.settings.theme);
  }, [profile?.settings?.theme]);

  const rupees = (Number(points) / 1000).toFixed(2);
  const isLoggedIn = !!identity;

  return (
    <div data-theme={theme} className="min-h-screen bg-background">
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)"
              : theme === "banana"
                ? "linear-gradient(160deg, #F6D24A 0%, #F39A2E 100%)"
                : "linear-gradient(160deg, #CFEFF0 0%, #E8C4B6 100%)",
        }}
      >
        <div
          className="relative w-full max-w-[430px] min-h-screen shadow-app flex flex-col overflow-hidden"
          style={{
            background:
              theme === "dark"
                ? "#1a1a2e"
                : theme === "banana"
                  ? "#FFF1C9"
                  : "#FFFDF7",
          }}
        >
          {/* Score Bar */}
          <div
            className="sticky top-0 z-20 flex items-center justify-between px-4 py-2"
            style={{ background: "linear-gradient(90deg, #F6D24A, #F39A2E)" }}
            data-ocid="score.panel"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🎰</span>
              <span className="font-bold text-sm text-amber-900">
                {Number(points).toLocaleString()} pts
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">💰</span>
              <span className="font-bold text-sm text-amber-900">
                ₹{rupees}
              </span>
            </div>
          </div>
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-border"
            style={{
              background:
                theme === "dark"
                  ? "#16213e"
                  : theme === "banana"
                    ? "#F6D24A"
                    : "#fff",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl float-anim">🎰</span>
              <span className="font-bold text-lg">
                <span style={{ color: theme === "dark" ? "#fff" : "#111" }}>
                  Spin to
                </span>
                <span style={{ color: "#F39A2E" }}> Earn</span>
              </span>
            </div>
            {!isLoggedIn && (
              <Button
                data-ocid="auth.primary_button"
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                size="sm"
                className="rounded-2xl text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #F39A2E, #e8831f)",
                }}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-1" /> Logging
                    in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            )}
          </div>
          {/* Main Content */}
          {isInitializing ? (
            <div
              className="flex-1 flex items-center justify-center"
              data-ocid="app.loading_state"
            >
              <div className="text-center">
                <div className="text-6xl float-anim">🎰</div>
                <p className="text-muted-foreground mt-3 font-semibold">
                  Loading Spin to Earn...
                </p>
              </div>
            </div>
          ) : !isLoggedIn ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center flex flex-col items-center gap-5">
                <div className="text-7xl float-anim">🎰</div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Welcome to
                    <br />
                    <span style={{ color: "#F39A2E" }}>Spin to Earn!</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Spin, scratch & win real rewards!
                    <br />
                    1000 points = ₹1.00
                  </p>
                </div>
                <div
                  className="rounded-3xl p-4 w-full text-left"
                  style={{
                    background: "linear-gradient(135deg, #FFF1C9, #F6D24A33)",
                  }}
                >
                  <p className="text-sm font-semibold text-amber-800 mb-2">
                    🎮 4 Exciting Games
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "🎰 Spin to Earn",
                      "🌄 Scratch Card",
                      "🏆 Lucky Winner",
                      "💎 Jackpot",
                    ].map((g) => (
                      <div
                        key={g}
                        className="text-xs bg-white/60 rounded-xl px-2 py-1.5 font-medium text-amber-900"
                      >
                        {g}
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  data-ocid="auth.login_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full rounded-2xl text-white font-bold py-6 text-lg pulse-glow"
                  style={{
                    background: "linear-gradient(135deg, #F39A2E, #e8831f)",
                  }}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Logging
                      in...
                    </>
                  ) : (
                    "🎰 Login to Play!"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pb-20">
              {activeTab === "games" && (
                <GamesTab currentPoints={points} onPointsUpdate={setPoints} />
              )}
              {activeTab === "profile" && <ProfileTab currentPoints={points} />}
              {activeTab === "settings" && (
                <SettingsTab theme={theme} onThemeChange={setTheme} />
              )}
            </div>
          )}
          {/* Bottom Tab Bar */}
          {isLoggedIn && (
            <div
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 flex items-center border-t border-border"
              style={{
                background:
                  theme === "dark"
                    ? "#16213e"
                    : theme === "banana"
                      ? "#F6D24A"
                      : "#fff",
              }}
            >
              {(
                [
                  { id: "games", label: "Games", emoji: "🎮" },
                  { id: "profile", label: "Profile", emoji: "👤" },
                  { id: "settings", label: "Settings", emoji: "⚙️" },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    data-ocid={`nav.${tab.id}.tab`}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-all"
                  >
                    <span
                      className="text-xl transition-transform"
                      style={{
                        transform: isActive ? "scale(1.25)" : "scale(1)",
                      }}
                    >
                      {tab.emoji}
                    </span>
                    <span
                      className="text-xs font-semibold transition-colors"
                      style={{
                        color: isActive
                          ? "#F39A2E"
                          : theme === "dark"
                            ? "#888"
                            : "#999",
                      }}
                    >
                      {tab.label}
                    </span>
                    {isActive && (
                      <div
                        className="absolute bottom-1 w-6 h-1 rounded-full"
                        style={{ background: "#F39A2E" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
