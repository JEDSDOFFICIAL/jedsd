


import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
   <><Navbar/>{children} <Footer /></>
  );
}
