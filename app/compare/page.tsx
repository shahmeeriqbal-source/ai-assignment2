import { readStore } from "@/lib/store";
import { attachSets } from "@/lib/scoring";
import { CompareClient } from "@/components/compare-client";

interface ComparePageProps {
  searchParams: Promise<{ playerAId?: string; playerBId?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const store = await readStore();
  const matches = attachSets(store.matches, store.matchSets);

  return (
    <CompareClient
      players={store.players}
      matches={matches}
      initialPlayerAId={params.playerAId}
      initialPlayerBId={params.playerBId}
    />
  );
}
