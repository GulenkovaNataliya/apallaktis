import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ΑΠΑΛΛΑΚΤΗΣ - Τέλος στη ρουτίνα!",
  description: "Mobile-first SaaS application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
