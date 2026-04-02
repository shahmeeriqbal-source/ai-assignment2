"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth-provider";

export function SiteShell({
  children,
  title,
  subtitle
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user) {
    return null;
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/players", label: "Players" },
    { href: "/compare", label: "Compare" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/admin", label: "Admin" }
  ];

  return (
    <main className="shell">
      <div className="nav">
        <div className="nav-links">
          <span className="pill brand">CourtLink</span>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link className={active ? "active" : undefined} href={link.href} key={link.href}>
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="nav-links">
          <span className="pill">
            {user.name} · {user.role}
          </span>
          <button
            className="secondary"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            type="button"
          >
            Log out
          </button>
        </div>
      </div>

      <section className="hero">
        <span className="badge">Local tennis community</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <section className="section">{children}</section>
    </main>
  );
}
