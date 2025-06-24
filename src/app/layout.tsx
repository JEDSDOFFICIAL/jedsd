

import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/utils/Provider";



export const metadata: Metadata = {
  title: "JEDSD | Journal of Embedded and Digital System Design ",
  description: "JEDSD is a peer-reviewed journal that publishes high-quality research in the field of embedded and digital system design. The journal aims to provide a platform for researchers, engineers, and practitioners to share their findings and advancements in this rapidly evolving field.",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logored.jpg" sizes="any" />
      </head>
      <body
        className={`antialiased `}
      >
        <Providers>

        {children}
        </Providers>
      </body>
    </html>
  );
}
