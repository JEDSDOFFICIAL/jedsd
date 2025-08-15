
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function WithNavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Navbar */}
      <header className="sticky top-0 z-50">
        <Navbar />
      </header>
      
      {/* Main Content - takes remaining space */}
      <main className="flex-1 w-full">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}
