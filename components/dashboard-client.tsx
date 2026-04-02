"use client";

import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { buildScoreline } from "@/lib/scoring";
import type { LeaderboardRow, Match, MatchSet, Player } from "@/lib/types";

type MatchWithSets = Match & { sets: MatchSet[] };

export function DashboardClient({
  players,
  matches,
  leaderboard
}: {
  players: Player[];
  matches: MatchWithSets[];
  leaderboard: LeaderboardRow[];
}) {
  const latestMatches = [...matches].sort((a, b) => b.playedAt.localeCompare(a.playedAt)).slice(0, 4);

  return (
    <SiteShell
      title="Keep every local match in one place."
      subtitle="CourtLink makes your sports complex feel organized, competitive, and easy to follow from a phone."
    >
      <div className="grid three">
        <div className="card stack">
          <span className="muted">Active players</span>
          <strong>{players.filter((player) => player.active).length}</strong>
          <span className="muted">Singles-focused local community roster</span>
        </div>
        <div className="card stack">
          <span className="muted">Completed matches</span>
          <strong>{matches.filter((match) => match.status === "completed").length}</strong>
          <span className="muted">Included in head-to-head and leaderboard</span>
        </div>
        <div className="card stack">
          <span className="muted">Top player</span>
          <strong>{leaderboard[0]?.playerName ?? "No data yet"}</strong>
          <span className="muted">
            {leaderboard[0] ? `${leaderboard[0].points} leaderboard points` : "Enter a result to start"}
          </span>
        </div>
      </div>

      <div className="grid two">
        <div className="card stack">
          <div className="split">
            <h2 className="section-title">Recent results</h2>
            <Link href="/admin">Add result</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Match</th>
                  <th>Winner</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {latestMatches.map((match) => {
                  const playerOne = players.find((player) => player.id === match.playerOneId)?.name ?? "Unknown";
                  const playerTwo = players.find((player) => player.id === match.playerTwoId)?.name ?? "Unknown";
                  const winner = players.find((player) => player.id === match.winnerId)?.name ?? "Unknown";

                  return (
                    <tr key={match.id}>
                      <td>{match.playedAt}</td>
                      <td>{playerOne} vs {playerTwo}</td>
                      <td>{winner}</td>
                      <td>{buildScoreline(match)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card stack">
          <div className="split">
            <h2 className="section-title">Leaderboard snapshot</h2>
            <Link href="/leaderboard">Open full table</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Pts</th>
                  <th>W-L</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, index) => (
                  <tr key={row.playerId}>
                    <td>{index + 1}</td>
                    <td>{row.playerName}</td>
                    <td>{row.points}</td>
                    <td>
                      {row.wins}-{row.losses}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
