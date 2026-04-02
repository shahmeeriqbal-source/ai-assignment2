import { describe, expect, test } from "vitest";

import { attachSets, calculateHeadToHead, calculateLeaderboard } from "@/lib/scoring";
import type { Match, MatchSet, Player } from "@/lib/types";
import { createMatchSchema } from "@/lib/validation";

const players: Player[] = [
  {
    id: "ali",
    name: "Ali",
    phone: "",
    email: "",
    handedness: "right",
    active: true
  },
  {
    id: "hamza",
    name: "Hamza",
    phone: "",
    email: "",
    handedness: "left",
    active: true
  },
  {
    id: "usman",
    name: "Usman",
    phone: "",
    email: "",
    handedness: "right",
    active: true
  }
];

const matches: Match[] = [
  {
    id: "m1",
    playerOneId: "ali",
    playerTwoId: "hamza",
    winnerId: "ali",
    matchType: "singles",
    status: "completed",
    playedAt: "2026-03-01",
    createdByUserId: "admin",
    notes: ""
  },
  {
    id: "m2",
    playerOneId: "hamza",
    playerTwoId: "ali",
    winnerId: "hamza",
    matchType: "singles",
    status: "completed",
    playedAt: "2026-03-05",
    createdByUserId: "admin",
    notes: ""
  },
  {
    id: "m3",
    playerOneId: "usman",
    playerTwoId: "ali",
    winnerId: "usman",
    matchType: "singles",
    status: "incomplete",
    playedAt: "2026-03-07",
    createdByUserId: "admin",
    notes: ""
  }
];

const matchSets: MatchSet[] = [
  { id: "s1", matchId: "m1", setNumber: 1, playerOneGames: 6, playerTwoGames: 3 },
  { id: "s2", matchId: "m1", setNumber: 2, playerOneGames: 4, playerTwoGames: 6 },
  { id: "s3", matchId: "m1", setNumber: 3, playerOneGames: 6, playerTwoGames: 2 },
  { id: "s4", matchId: "m2", setNumber: 1, playerOneGames: 6, playerTwoGames: 4 },
  { id: "s5", matchId: "m2", setNumber: 2, playerOneGames: 7, playerTwoGames: 5 },
  { id: "s6", matchId: "m3", setNumber: 1, playerOneGames: 6, playerTwoGames: 1 },
  { id: "s7", matchId: "m3", setNumber: 2, playerOneGames: 2, playerTwoGames: 1 }
];

describe("match validation", () => {
  test("rejects the same player on both sides", () => {
    expect(() =>
      createMatchSchema.parse({
        playerOneId: "ali",
        playerTwoId: "ali",
        winnerId: "ali",
        playedAt: "2026-03-10",
        status: "completed",
        matchType: "singles",
        createdByUserId: "admin",
        sets: [
          { playerOneGames: 6, playerTwoGames: 4 },
          { playerOneGames: 6, playerTwoGames: 2 }
        ]
      })
    ).toThrow(/Players must be different/);
  });

  test("rejects invalid score formats", () => {
    expect(() =>
      createMatchSchema.parse({
        playerOneId: "ali",
        playerTwoId: "hamza",
        winnerId: "ali",
        playedAt: "2026-03-10",
        status: "completed",
        matchType: "singles",
        createdByUserId: "admin",
        sets: [
          { playerOneGames: 6, playerTwoGames: 6 },
          { playerOneGames: 6, playerTwoGames: 2 }
        ]
      })
    ).toThrow(/cannot end in a tie/);
  });

  test("accepts straight-set and three-set matches", () => {
    expect(() =>
      createMatchSchema.parse({
        playerOneId: "ali",
        playerTwoId: "hamza",
        winnerId: "ali",
        playedAt: "2026-03-10",
        status: "completed",
        matchType: "singles",
        createdByUserId: "admin",
        sets: [
          { playerOneGames: 6, playerTwoGames: 4 },
          { playerOneGames: 6, playerTwoGames: 3 }
        ]
      })
    ).not.toThrow();

    expect(() =>
      createMatchSchema.parse({
        playerOneId: "ali",
        playerTwoId: "hamza",
        winnerId: "hamza",
        playedAt: "2026-03-10",
        status: "completed",
        matchType: "singles",
        createdByUserId: "admin",
        sets: [
          { playerOneGames: 4, playerTwoGames: 6 },
          { playerOneGames: 6, playerTwoGames: 2 },
          { playerOneGames: 3, playerTwoGames: 6 }
        ]
      })
    ).not.toThrow();
  });
});

describe("head-to-head and leaderboard logic", () => {
  const matchesWithSets = attachSets(matches, matchSets);

  test("computes head-to-head totals and set totals correctly", () => {
    const summary = calculateHeadToHead(players, matchesWithSets, "ali", "hamza");

    expect(summary).not.toBeNull();
    expect(summary?.totalMeetings).toBe(2);
    expect(summary?.wins.ali).toBe(1);
    expect(summary?.wins.hamza).toBe(1);
    expect(summary?.setsWon.ali).toBe(3);
    expect(summary?.setsWon.hamza).toBe(2);
    expect(summary?.recentMatches[0]?.playedAt).toBe("2026-03-05");
  });

  test("returns an empty rivalry cleanly when no completed meetings exist", () => {
    const summary = calculateHeadToHead(players, matchesWithSets, "hamza", "usman");

    expect(summary?.totalMeetings).toBe(0);
    expect(summary?.recentMatches).toHaveLength(0);
  });

  test("builds leaderboard points and excludes incomplete matches", () => {
    const leaderboard = calculateLeaderboard(players, matchesWithSets);

    expect(leaderboard[0]?.playerId).toBe("hamza");
    expect(leaderboard.find((row) => row.playerId === "ali")?.matchesPlayed).toBe(2);
    expect(leaderboard.find((row) => row.playerId === "usman")?.matchesPlayed).toBe(0);
    expect(leaderboard.find((row) => row.playerId === "hamza")?.points).toBe(4);
  });
});
