"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth-provider";
import type { User } from "@/lib/types";

export function LoginPanel({ users }: { users: User[] }) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const { login } = useAuth();
  const router = useRouter();

  return (
    <div className="card stack">
      <h2 className="section-title">Quick access for local players and staff</h2>
      <p className="muted">
        This MVP uses demo accounts so your complex can test workflows before adding real
        authentication.
      </p>
      <label>
        Sign in as
        <select onChange={(event) => setSelectedUserId(event.target.value)} value={selectedUserId}>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} · {user.role}
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={() => {
          const nextUser = users.find((user) => user.id === selectedUserId);
          if (!nextUser) {
            return;
          }
          login(nextUser);
          router.push("/dashboard");
        }}
        type="button"
      >
        Enter CourtLink
      </button>
    </div>
  );
}
