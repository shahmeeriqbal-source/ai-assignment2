"use client";

import { useState } from "react";

import { SiteShell } from "@/components/site-shell";
import { useAuth } from "@/components/auth-provider";
import type { Match, Player, User } from "@/lib/types";

const blankSets = [
  { playerOneGames: 6, playerTwoGames: 4 },
  { playerOneGames: 6, playerTwoGames: 3 }
];

export function AdminClient({
  players,
  users,
  matches
}: {
  players: Player[];
  users: User[];
  matches: Match[];
}) {
  const { user } = useAuth();
  const [playerOneId, setPlayerOneId] = useState(players[0]?.id ?? "");
  const [playerTwoId, setPlayerTwoId] = useState(players[1]?.id ?? "");
  const [winnerId, setWinnerId] = useState(players[0]?.id ?? "");
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [sets, setSets] = useState(blankSets);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canManage = user?.role === "admin";

  async function submitMatch() {
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/matches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        playerOneId,
        playerTwoId,
        winnerId,
        playedAt,
        status: "completed",
        matchType: "singles",
        sets,
        createdByUserId: user?.id ?? users[0]?.id,
        notes
      })
    });

    const payload = (await response.json()) as { ok?: boolean; message?: string };
    setSubmitting(false);

    if (!response.ok) {
      setMessage(payload.message ?? "Could not save the result.");
      return;
    }

    setMessage("Match saved. Refresh pages to see updated leaderboard and comparisons.");
    setNotes("");
  }

  return (
    <SiteShell
      title="Record results quickly after local matches."
      subtitle="Admins can keep the history clean, while players can still review how the community ladder is evolving."
    >
      {!canManage ? (
        <div className="card">
          <p className="warning">Only admin users can submit or correct official match results in this MVP.</p>
        </div>
      ) : (
        <div className="grid two">
          <div className="card stack">
            <h2 className="section-title">Add completed match</h2>
            <div className="form-grid">
              <label>
                Player one
                <select onChange={(event) => setPlayerOneId(event.target.value)} value={playerOneId}>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Player two
                <select onChange={(event) => setPlayerTwoId(event.target.value)} value={playerTwoId}>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Winner
                <select onChange={(event) => setWinnerId(event.target.value)} value={winnerId}>
                  {[playerOneId, playerTwoId].map((playerId) => {
                    const player = players.find((item) => item.id === playerId);
                    return (
                      <option key={playerId} value={playerId}>
                        {player?.name ?? playerId}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label>
                Match date
                <input onChange={(event) => setPlayedAt(event.target.value)} type="date" value={playedAt} />
              </label>
            </div>

            <div className="stack">
              {sets.map((set, index) => (
                <div className="form-grid" key={`set-${index + 1}`}>
                  <label>
                    Set {index + 1} player one games
                    <input
                      min={0}
                      max={7}
                      onChange={(event) => {
                        const next = [...sets];
                        next[index] = { ...next[index], playerOneGames: Number(event.target.value) };
                        setSets(next);
                      }}
                      type="number"
                      value={set.playerOneGames}
                    />
                  </label>
                  <label>
                    Set {index + 1} player two games
                    <input
                      min={0}
                      max={7}
                      onChange={(event) => {
                        const next = [...sets];
                        next[index] = { ...next[index], playerTwoGames: Number(event.target.value) };
                        setSets(next);
                      }}
                      type="number"
                      value={set.playerTwoGames}
                    />
                  </label>
                </div>
              ))}
            </div>

            <button
              className="secondary"
              onClick={() => setSets([...sets, { playerOneGames: 0, playerTwoGames: 0 }].slice(0, 3))}
              type="button"
            >
              Add third set
            </button>

            <label>
              Notes
              <textarea onChange={(event) => setNotes(event.target.value)} rows={3} value={notes} />
            </label>

            <button disabled={submitting} onClick={submitMatch} type="button">
              {submitting ? "Saving..." : "Save match"}
            </button>
            {message ? <p className={message.includes("saved") ? "muted" : "warning"}>{message}</p> : null}
          </div>

          <div className="card stack">
            <h2 className="section-title">Recent recorded matches</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Players</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...matches]
                    .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
                    .slice(0, 8)
                    .map((match) => (
                      <tr key={match.id}>
                        <td>{match.playedAt}</td>
                        <td>
                          {players.find((player) => player.id === match.playerOneId)?.name} vs{" "}
                          {players.find((player) => player.id === match.playerTwoId)?.name}
                        </td>
                        <td>{match.status}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  );
}
