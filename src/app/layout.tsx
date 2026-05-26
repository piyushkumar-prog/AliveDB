import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AliveDB — Supabase Keep-Alive Monitor",
    template: "%s | AliveDB",
  },
  description:
    "Minimal self-hosted keep-alive monitoring for Supabase projects. Prevent your Supabase instances from pausing with automated endpoint pinging.",
  keywords: ["supabase", "keep-alive", "monitoring", "self-hosted", "devops"],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "AliveDB",
    description: "Minimal self-hosted keep-alive monitoring for Supabase projects.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-layout">
          {children}
        </div>
      </body>
    </html>
  );
}
