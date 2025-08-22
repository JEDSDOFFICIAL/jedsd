
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function WithNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Fixed Navbar */}
      <header className="sticky top-0 z-50 w-full max-w-full">
        <Navbar />
      </header>
      
      {/* Main Content - takes remaining space */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="mt-auto w-full max-w-full">
        <Footer />
      </footer>
    </div>
  );
}
