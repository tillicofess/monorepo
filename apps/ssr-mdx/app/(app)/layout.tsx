import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
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
