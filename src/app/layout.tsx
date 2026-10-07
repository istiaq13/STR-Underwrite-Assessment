import type { Metadata } from "next";
import "./globals.css";
import { UnderwritingProvider } from "@/lib/context";
import { Navbar } from "@/components/layout/Navbar";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export const metadata: Metadata = {
  title: "STR Underwrite LabAnalyst - Short-Term Rental Analyst Training",
  description:
    "Interactive underwriting training workspace for short-term rental analysts. Evaluate vacation rental properties, forecast revenues, and receive real-time benchmark scores against senior analysts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white">
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-slate-900 selection:text-white flex flex-col">
        <UnderwritingProvider>
          <TopProgressBar />
          <Navbar />
          <main className="flex-1 w-full">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          <footer className="border-t border-neutral-100 bg-white py-8 mt-16 text-center text-xs text-neutral-400">
            <div className="max-w-[1440px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© 2026 STR Underwrite LabAnalyst. Real Estate Analyst Training & Evaluation.</p>
              <div className="flex items-center gap-4 text-neutral-400">
                <span>Real Estate Intelligence</span>
                <span>•</span>
                <span>STR Underwrite Analyst</span>
              </div>
            </div>
          </footer>
        </UnderwritingProvider>
      </body>
    </html>
  );
}
