import { promises as fs } from "fs";
import path from "path";

import { AppStore, CreateMatchInput, MatchSet, Player } from "@/lib/types";
import { createMatchSchema } from "@/lib/validation";

const dataPath = path.join(process.cwd(), "data", "store.json");

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function readStore(): Promise<AppStore> {
  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw) as AppStore;
}

async function writeStore(store: AppStore): Promise<void> {
  await fs.writeFile(dataPath, JSON.stringify(store, null, 2));
}

export async function searchPlayers(query?: string): Promise<Player[]> {
  const store = await readStore();
  const normalizedQuery = query?.trim().toLowerCase();

  if (!normalizedQuery) {
    return store.players.sort((left, right) => left.name.localeCompare(right.name));
  }

  return store.players
    .filter((player) => player.name.toLowerCase().includes(normalizedQuery))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function createMatch(input: CreateMatchInput) {
  const parsed = createMatchSchema.parse(input);
  const store = await readStore();

  const matchId = generateId("match");
  const sets: MatchSet[] = parsed.sets.map((set, index) => ({
    id: generateId("set"),
    matchId,
    setNumber: index + 1,
    playerOneGames: set.playerOneGames,
    playerTwoGames: set.playerTwoGames
  }));

  store.matches.push({
    id: matchId,
    playerOneId: parsed.playerOneId,
    playerTwoId: parsed.playerTwoId,
    winnerId: parsed.winnerId,
    matchType: parsed.matchType,
    status: parsed.status,
    playedAt: parsed.playedAt,
    createdByUserId: parsed.createdByUserId,
    notes: parsed.notes ?? ""
  });

  store.matchSets.push(...sets);
  await writeStore(store);

  return { matchId, setsCount: sets.length };
}
