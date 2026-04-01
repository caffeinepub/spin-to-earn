import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    totalRupees: number;
    username: string;
    displayName: string;
    email: string;
    settings: {
        theme: string;
        notificationsEnabled: boolean;
        soundEnabled: boolean;
    };
    points: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<UserProfile>>;
    getProfile(user: Principal): Promise<UserProfile>;
    getRupeesFromPoints(points: bigint): Promise<number>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    jackpot(points: bigint): Promise<bigint>;
    luckyWinner(points: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    scratchCard(points: bigint): Promise<bigint>;
    spinWheel(points: bigint): Promise<bigint>;
    updateProfile(profile: UserProfile): Promise<void>;
}
