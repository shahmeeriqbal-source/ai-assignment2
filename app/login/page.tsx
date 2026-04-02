import { readStore } from "@/lib/store";
import { LoginPanel } from "@/components/login-panel";

export default async function LoginPage() {
  const store = await readStore();

  return (
    <main className="shell">
      <section className="hero">
        <span className="badge">Private sports complex app</span>
        <h1>CourtLink keeps local tennis rivalries organized.</h1>
        <p>
          Track local players, enter match scores, compare head-to-head records, and keep the
          leaderboard alive without paperwork.
        </p>
      </section>
      <section className="section">
        <LoginPanel users={store.users} />
      </section>
    </main>
  );
}
