import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'CertifyHub - Frontend Certificate Generator',
  description:
    'A complete, polished, frontend-only Certificate Generator for colleges, universities, companies, and training programs. Create events, import CSV recipients, and generate browser-based PDF certificates with verification QR codes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
