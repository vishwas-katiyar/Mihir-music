import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { EstimateDrawerProvider, EstimateDrawer } from "@/components/providers/EstimateDrawer";

/** Marketing chrome: nav, footer, WhatsApp float and the estimator drawer. Admin and share pages opt out. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <EstimateDrawerProvider>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <FloatingCTA />
      <EstimateDrawer />
    </EstimateDrawerProvider>
  );
}
