import type { Metadata } from "next";

import "@/app/globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "CourtLink Local Tennis",
  description: "Private local tennis app for players, results, head-to-head stats, and leaderboard."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
