import React from 'react';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';

import './globals.css';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <ClerkProvider>
        <body>
          <main>{children}</main>
        </body>
      </ClerkProvider>
    </html>
  );
}
