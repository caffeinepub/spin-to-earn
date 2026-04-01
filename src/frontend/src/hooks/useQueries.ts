import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSpinWheel() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (points: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.spinWheel(points);
    },
  });
}

export function useScratchCard() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (points: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.scratchCard(points);
    },
  });
}

export function useLuckyWinner() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (points: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.luckyWinner(points);
    },
  });
}

export function useJackpot() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (points: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.jackpot(points);
    },
  });
}
