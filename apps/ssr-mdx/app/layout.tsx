import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@/styles/globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import CrispChat from '@/components/CrispChat';
import { ThemeProvider } from '@/components/theme-provider';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { TooltipProvider } from '@/components/ui/tooltip';

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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
