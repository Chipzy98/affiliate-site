import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Tracker from "@/components/Tracker";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <Tracker />
    </>
  );
}
