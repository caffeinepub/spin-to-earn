import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSaveProfile, useUserProfile } from "@/hooks/useQueries";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";

interface Props {
  theme: string;
  onThemeChange: (theme: string) => void;
}

const THEMES = [
  { id: "light", label: "Light", emoji: "🌞", desc: "Clean & bright" },
  { id: "dark", label: "Dark", emoji: "🌙", desc: "Easy on eyes" },
  { id: "banana", label: "Banana", emoji: "🍌", desc: "Fun & fruity" },
];

export default function SettingsTab({ theme, onThemeChange }: Props) {
  const { data: profile } = useUserProfile();
  const saveProfile = useSaveProfile();

  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (profile?.settings) {
      setSound(profile.settings.soundEnabled);
      setNotifications(profile.settings.notificationsEnabled);
    }
  }, [profile]);

  const handleSave = () => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      settings: {
        theme,
        soundEnabled: sound,
        notificationsEnabled: notifications,
      },
    };
    saveProfile.mutate(updated, {
      onSuccess: () => toast.success("Settings saved! ✅"),
      onError: () => toast.error("Failed to save settings"),
    });
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Theme Selector */}
      <div className="rounded-3xl p-5 bg-card shadow-card">
        <p className="font-bold text-foreground mb-3">🎨 Theme</p>
        <div className="flex flex-col gap-2">
          {THEMES.map((t) => (
            <button
              type="button"
              key={t.id}
              data-ocid={`settings.${t.id}.toggle`}
              onClick={() => onThemeChange(t.id)}
              className="flex items-center gap-3 p-3 rounded-2xl transition-all"
              style={{
                background:
                  theme === t.id
                    ? "linear-gradient(135deg, #F6D24A33, #F39A2E22)"
                    : "transparent",
                border:
                  theme === t.id
                    ? "2px solid #F39A2E"
                    : "2px solid transparent",
              }}
            >
              <span className="text-2xl">{t.emoji}</span>
              <div className="text-left">
                <p className="font-bold text-sm text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
              {theme === t.id && (
                <span className="ml-auto text-orange-500 font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Settings */}
      <div className="rounded-3xl p-5 bg-card shadow-card flex flex-col gap-4">
        <p className="font-bold text-foreground">⚙️ Preferences</p>

        <div className="flex items-center justify-between">
          <div>
            <Label className="font-semibold">🔊 Sound Effects</Label>
            <p className="text-xs text-muted-foreground">
              Game sounds & feedback
            </p>
          </div>
          <Switch
            data-ocid="settings.sound.switch"
            checked={sound}
            onCheckedChange={setSound}
          />
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between">
          <div>
            <Label className="font-semibold">🔔 Notifications</Label>
            <p className="text-xs text-muted-foreground">
              Game alerts & rewards
            </p>
          </div>
          <Switch
            data-ocid="settings.notifications.switch"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
      </div>

      {/* Save Button */}
      <Button
        data-ocid="settings.save_button"
        onClick={handleSave}
        disabled={saveProfile.isPending}
        className="rounded-2xl text-white font-bold py-5"
        style={{ background: "linear-gradient(135deg, #F39A2E, #e8831f)" }}
      >
        {saveProfile.isPending ? "Saving..." : "💾 Save Settings"}
      </Button>

      {/* App info */}
      <div className="rounded-2xl p-4 bg-card shadow-card text-center">
        <p className="text-2xl mb-1">🍌</p>
        <p className="font-bold text-foreground">BananaSpin</p>
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        <p className="text-xs text-muted-foreground mt-1">1000 pts = ₹1.00</p>
      </div>
    </div>
  );
}
