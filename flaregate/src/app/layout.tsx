
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import ContextProvider from '@/context';
import { headers } from "next/headers"; // added

export const metadata: Metadata = {
  title: "AppKit Example App",
  description: "Powered by WalletConnect"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers();
  const cookies = headersList.get('cookie');

  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  )
}