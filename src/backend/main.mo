import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // User profile type
  public type UserProfile = {
    username : Text;
    displayName : Text;
    email : Text;
    points : Nat;
    totalRupees : Float;
    settings : {
      theme : Text;
      soundEnabled : Bool;
      notificationsEnabled : Bool;
    };
  };

  module UserProfile {
    public func compare(user1 : UserProfile, user2 : UserProfile) : Order.Order {
      switch (Nat.compare(user2.points, user1.points)) {
        case (#equal) { Text.compare(user1.username, user2.username) };
        case (order) { order };
      };
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Get any user's profile (own profile or admin viewing others)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Legacy function for backward compatibility - restricted to own profile or admin
  public query ({ caller }) func getProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  // Update own profile
  public shared ({ caller }) func updateProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Game functions - require user authentication
  public shared ({ caller }) func spinWheel(points : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play games");
    };
    addPoints(caller, points);
  };

  public shared ({ caller }) func scratchCard(points : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play games");
    };
    addPoints(caller, points);
  };

  public shared ({ caller }) func luckyWinner(points : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play games");
    };
    addPoints(caller, points);
  };

  public shared ({ caller }) func jackpot(points : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can play games");
    };
    addPoints(caller, points);
  };

  // Public leaderboard - no authentication required
  public query ({ caller }) func getLeaderboard() : async [UserProfile] {
    userProfiles.values().toArray().sort().sliceToArray(0, Nat.min(10, userProfiles.size()));
  };

  // Utility function - no authentication required
  public query ({ caller }) func getRupeesFromPoints(points : Nat) : async Float {
    points.toInt().toFloat() / 1000;
  };

  // Internal helper function
  func addPoints(user : Principal, points : Nat) : Nat {
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let newTotal = profile.points + points;
        let newRupees = newTotal.toInt().toFloat() / 1000;
        let updatedProfile = {
          profile with
          points = newTotal;
          totalRupees = newRupees;
        };
        userProfiles.add(user, updatedProfile);
        newTotal;
      };
    };
  };
};
