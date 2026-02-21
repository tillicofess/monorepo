import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/sections/Footer';
import ScrollToTop from '@/components/ui/ScrollToTop';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="max-w-screen overflow-x-hidden px-2">{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
