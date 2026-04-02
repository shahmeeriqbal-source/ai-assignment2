import { readStore } from "@/lib/store";
import { PlayersClient } from "@/components/players-client";

export default async function PlayersPage() {
  const store = await readStore();

  return <PlayersClient players={store.players} />;
}
