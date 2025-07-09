
import Navbar from "@/components/home/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    
      <main className="relative w-full">
        {children}
      </main>
  );
}
