"use client";

import { useMemo, useState } from "react";

import { SiteShell } from "@/components/site-shell";
import type { Player } from "@/lib/types";

export function PlayersClient({ players }: { players: Player[] }) {
  const [query, setQuery] = useState("");
  const filteredPlayers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return players;
    }
    return players.filter((player) => player.name.toLowerCase().includes(normalized));
  }, [players, query]);

  return (
    <SiteShell
      title="Know who is active at the complex."
      subtitle="Search the local player directory before recording matches or setting up a rivalry comparison."
    >
      <div className="card stack">
        <label>
          Search local players
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by player name"
            value={query}
          />
        </label>
      </div>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Hand</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => (
              <tr key={player.id}>
                <td>{player.name}</td>
                <td>{player.handedness}</td>
                <td>{player.phone}</td>
                <td>{player.email}</td>
                <td>{player.active ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SiteShell>
  );
}
