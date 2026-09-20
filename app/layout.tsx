import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './daymark.css';
import './product-polish.css';
import './product-responsive.css';
import './customer-experience.css';
import './campaign-checks.css';
import './operator.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Daymark — Who to email today',
  icons: { icon: '/favicon.svg' },
  description:
    'Daymark is a desk for failed payments, new buyers, and refunds: who to email, who to stop, who to leave alone. $49 once or $19 a month. The sample marketing report stays labeled fiction.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
