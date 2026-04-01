import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSaveProfile, useUserProfile } from "@/hooks/useQueries";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";

interface Props {
  currentPoints: bigint;
}

export default function ProfileTab({ currentPoints }: Props) {
  const { data: profile, isLoading } = useUserProfile();
  const saveProfile = useSaveProfile();

  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName,
        username: profile.username,
        email: profile.email,
      });
    }
  }, [profile]);

  const handleSave = () => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      ...form,
      points: currentPoints,
      totalRupees: Number(currentPoints) / 1000,
    };
    saveProfile.mutate(updated, {
      onSuccess: () => toast.success("Profile saved! ✅"),
      onError: () => toast.error("Failed to save profile"),
    });
  };

  const initials = form.displayName
    ? form.displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const rupees = (Number(currentPoints) / 1000).toFixed(2);

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Avatar & Points */}
      <div
        className="rounded-3xl p-5 flex flex-col items-center gap-3 shadow-card"
        style={{ background: "linear-gradient(135deg, #F6D24A, #F39A2E)" }}
      >
        <Avatar className="w-20 h-20 border-4 border-white shadow-app">
          <AvatarFallback className="text-2xl font-bold bg-white text-orange-500">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="font-bold text-lg text-white">
            {form.displayName || "Set your name"}
          </p>
          <p className="text-sm text-amber-900">
            @{form.username || "username"}
          </p>
        </div>
        <div className="flex gap-4 mt-1">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {currentPoints.toString()}
            </p>
            <p className="text-xs text-amber-900">Total Points</p>
          </div>
          <div className="w-px bg-amber-300" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">₹{rupees}</p>
            <p className="text-xs text-amber-900">Value</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="rounded-3xl p-5 bg-card shadow-card flex flex-col gap-4">
        <p className="font-bold text-foreground">Edit Profile</p>

        {isLoading ? (
          <>
            <Skeleton
              className="h-10 rounded-2xl"
              data-ocid="profile.loading_state"
            />
            <Skeleton className="h-10 rounded-2xl" />
            <Skeleton className="h-10 rounded-2xl" />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <Label htmlFor="displayName" className="text-sm font-semibold">
                Display Name
              </Label>
              <Input
                id="displayName"
                data-ocid="profile.input"
                value={form.displayName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, displayName: e.target.value }))
                }
                placeholder="Your display name"
                className="rounded-2xl"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="username" className="text-sm font-semibold">
                Username
              </Label>
              <Input
                id="username"
                data-ocid="profile.username.input"
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
                placeholder="@username"
                className="rounded-2xl"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <Input
                id="email"
                data-ocid="profile.email.input"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="you@example.com"
                type="email"
                className="rounded-2xl"
              />
            </div>
            <Button
              data-ocid="profile.save_button"
              onClick={handleSave}
              disabled={saveProfile.isPending}
              className="rounded-2xl text-white font-bold py-5"
              style={{
                background: "linear-gradient(135deg, #F39A2E, #e8831f)",
              }}
            >
              {saveProfile.isPending ? "Saving..." : "💾 Save Profile"}
            </Button>
          </>
        )}
      </div>

      {/* Rate info */}
      <div
        className="rounded-2xl p-3 text-center text-sm font-medium"
        style={{ background: "oklch(var(--cream))", color: "#7a5c00" }}
      >
        💡 1000 points = ₹1.00
      </div>
    </div>
  );
}
