import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mira API",
  description: "Mira backend — Next.js App Router",
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
