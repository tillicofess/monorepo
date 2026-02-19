import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import CrispChat from '@/components/CrispChat';
import { ThemeProvider } from '@/components/theme-provider';
import ScrollToTop from '@/components/ui/ScrollToTop';

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
  title: 'Developer Blog',
  description: 'Building things with code and writing about the journey',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            {children}
            <ScrollToTop />
            <CrispChat />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
