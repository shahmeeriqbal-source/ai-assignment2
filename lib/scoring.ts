import { Match, MatchSet, Player, HeadToHeadSummary, LeaderboardRow } from "@/lib/types";

interface MatchWithSets extends Match {
  sets: MatchSet[];
}

function getScoreline(match: MatchWithSets): string {
  return match.sets
    .sort((a, b) => a.setNumber - b.setNumber)
    .map((set) => `${set.playerOneGames}-${set.playerTwoGames}`)
    .join(", ");
}

export function calculateLeaderboard(players: Player[], matches: MatchWithSets[]): LeaderboardRow[] {
  const rows = new Map<string, LeaderboardRow>();

  for (const player of players.filter((item) => item.active)) {
    rows.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      points: 0,
      winPercentage: 0,
      setsWon: 0,
      setsLost: 0,
      setDifferential: 0
    });
  }

  for (const match of matches.filter((item) => item.status === "completed")) {
    const playerOne = rows.get(match.playerOneId);
    const playerTwo = rows.get(match.playerTwoId);

    if (!playerOne || !playerTwo) {
      continue;
    }

    playerOne.matchesPlayed += 1;
    playerTwo.matchesPlayed += 1;

    if (match.winnerId === match.playerOneId) {
      playerOne.wins += 1;
      playerTwo.losses += 1;
      playerOne.points += 3;
      playerTwo.points += 1;
    } else {
      playerTwo.wins += 1;
      playerOne.losses += 1;
      playerTwo.points += 3;
      playerOne.points += 1;
    }

    for (const set of match.sets) {
      const playerOneWonSet = set.playerOneGames > set.playerTwoGames;

      if (playerOneWonSet) {
        playerOne.setsWon += 1;
        playerTwo.setsLost += 1;
      } else {
        playerTwo.setsWon += 1;
        playerOne.setsLost += 1;
      }
    }
  }

  return [...rows.values()]
    .map((row) => ({
      ...row,
      winPercentage: row.matchesPlayed === 0 ? 0 : Number((row.wins / row.matchesPlayed).toFixed(3)),
      setDifferential: row.setsWon - row.setsLost
    }))
    .sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }
      if (right.winPercentage !== left.winPercentage) {
        return right.winPercentage - left.winPercentage;
      }
      if (right.setDifferential !== left.setDifferential) {
        return right.setDifferential - left.setDifferential;
      }
      return left.playerName.localeCompare(right.playerName);
    });
}

export function calculateHeadToHead(
  players: Player[],
  matches: MatchWithSets[],
  playerAId: string,
  playerBId: string
): HeadToHeadSummary | null {
  const playerA = players.find((player) => player.id === playerAId);
  const playerB = players.find((player) => player.id === playerBId);

  if (!playerA || !playerB || playerAId === playerBId) {
    return null;
  }

  const relevantMatches = matches
    .filter(
      (match) =>
        match.status === "completed" &&
        ((match.playerOneId === playerAId && match.playerTwoId === playerBId) ||
          (match.playerOneId === playerBId && match.playerTwoId === playerAId))
    )
    .sort((left, right) => right.playedAt.localeCompare(left.playedAt));

  const wins: Record<string, number> = {
    [playerAId]: 0,
    [playerBId]: 0
  };

  const setsWon: Record<string, number> = {
    [playerAId]: 0,
    [playerBId]: 0
  };

  for (const match of relevantMatches) {
    wins[match.winnerId] += 1;

    for (const set of match.sets) {
      const playerOneWonSet = set.playerOneGames > set.playerTwoGames;
      const setWinnerId = playerOneWonSet ? match.playerOneId : match.playerTwoId;
      setsWon[setWinnerId] += 1;
    }
  }

  return {
    players: [playerA, playerB],
    totalMeetings: relevantMatches.length,
    wins,
    setsWon,
    recentMatches: relevantMatches.map((match) => ({
      id: match.id,
      playedAt: match.playedAt,
      winnerId: match.winnerId,
      scoreline: getScoreline(match),
      notes: match.notes
    }))
  };
}

export function attachSets(matches: Match[], matchSets: MatchSet[]): MatchWithSets[] {
  return matches.map((match) => ({
    ...match,
    sets: matchSets
      .filter((set) => set.matchId === match.id)
      .sort((left, right) => left.setNumber - right.setNumber)
  }));
}

export function buildScoreline(match: MatchWithSets): string {
  return getScoreline(match);
}
