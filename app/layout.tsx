import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitPulse - PR Triage Dashboard",
  description:
    "An animated GitHub pull-request triage dashboard. Replaces messy notifications with a prioritized action center.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
