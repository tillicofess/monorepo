import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import '@/styles/globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import CrispChat from '@/components/CrispChat';
import { ThemeProvider } from '@/components/theme-provider';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { TooltipProvider } from '@/components/ui/tooltip';
import MonitorInit from '@/components/monitor/monitor-init';

const geist = localFont({
  src: [
    { path: '../public/fonts/Geist-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Geist-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-geist',
});

const geistMono = localFont({
  src: [
    { path: '../public/fonts/GeistMono-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/GeistMono-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Till i Confess | Design Engineer',
  description: 'A design engineer building things with code',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <ScrollToTop />
            <CrispChat />
            <MonitorInit />
            <Script
              defer
              src="https://umami.ticscreek.top/script.js"
              data-website-id="00a1090c-ed02-4aa0-85a9-2915a980c736"
              strategy="afterInteractive"
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
