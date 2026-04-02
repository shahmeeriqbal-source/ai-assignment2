import { readStore } from "@/lib/store";
import { AdminClient } from "@/components/admin-client";

export default async function AdminPage() {
  const store = await readStore();

  return <AdminClient players={store.players} users={store.users} matches={store.matches} />;
}
