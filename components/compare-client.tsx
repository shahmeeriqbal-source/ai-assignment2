"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { calculateHeadToHead } from "@/lib/scoring";
import type { Match, MatchSet, Player } from "@/lib/types";

type MatchWithSets = Match & { sets: MatchSet[] };

export function CompareClient({
  players,
  matches,
  initialPlayerAId,
  initialPlayerBId
}: {
  players: Player[];
  matches: MatchWithSets[];
  initialPlayerAId?: string;
  initialPlayerBId?: string;
}) {
  const router = useRouter();
  const [playerAId, setPlayerAId] = useState(initialPlayerAId ?? players[0]?.id ?? "");
  const [playerBId, setPlayerBId] = useState(initialPlayerBId ?? players[1]?.id ?? "");

  const summary = useMemo(
    () => calculateHeadToHead(players, matches, playerAId, playerBId),
    [matches, playerAId, playerBId, players]
  );

  return (
    <SiteShell
      title="Compare two local players before the next match."
      subtitle="See who leads the rivalry, who wins more sets, and what the previous scorelines looked like."
    >
      <div className="card stack">
        <div className="form-grid">
          <label>
            Player A
            <select onChange={(event) => setPlayerAId(event.target.value)} value={playerAId}>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Player B
            <select onChange={(event) => setPlayerBId(event.target.value)} value={playerBId}>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          onClick={() => router.replace(`/compare?playerAId=${playerAId}&playerBId=${playerBId}`)}
          type="button"
        >
          Update comparison
        </button>
      </div>

      {!summary ? (
        <div className="card">
          <p className="warning">Choose two different players to see a valid head-to-head comparison.</p>
        </div>
      ) : (
        <>
          <div className="grid three">
            <div className="card stack">
              <span className="muted">Total meetings</span>
              <strong>{summary.totalMeetings}</strong>
            </div>
            <div className="card stack">
              <span className="muted">Match wins</span>
              <strong>
                {summary.players[0].name} {summary.wins[summary.players[0].id]} - {summary.wins[summary.players[1].id]}{" "}
                {summary.players[1].name}
              </strong>
            </div>
            <div className="card stack">
              <span className="muted">Set wins</span>
              <strong>
                {summary.setsWon[summary.players[0].id]} - {summary.setsWon[summary.players[1].id]}
              </strong>
            </div>
          </div>

          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Winner</th>
                  <th>Scoreline</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentMatches.length === 0 ? (
                  <tr>
                    <td colSpan={4}>These two players have not played each other yet.</td>
                  </tr>
                ) : (
                  summary.recentMatches.map((match) => (
                    <tr key={match.id}>
                      <td>{match.playedAt}</td>
                      <td>{players.find((player) => player.id === match.winnerId)?.name ?? "Unknown"}</td>
                      <td>{match.scoreline}</td>
                      <td>{match.notes || "No notes"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </SiteShell>
  );
}
