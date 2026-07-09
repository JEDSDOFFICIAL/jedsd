

import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/lib/Provider";
import Head from "next/head";



export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://jedsd.com'),
  title: {
    default: 'JEDSD | Journal of Embedded and Digital System Design',
    template: '%s | JEDSD',
  },
  description: 'JEDSD is a peer-reviewed journal that publishes high-quality research in the field of embedded and digital system design. The journal aims to provide a platform for researchers, engineers, and practitioners to share their findings and advancements in this rapidly evolving field.',
  keywords: [
    'embedded systems',
    'digital system design',
    'research journal',
    'academic publishing',
    'peer-reviewed',
    'JEDSD',
    'electronics',
    'computer engineering',
    'VLSI',
    'IoT',
    'microcontrollers',
  ],
  authors: [{ name: 'JEDSD Editorial Board' }],
  creator: 'JEDSD',
  publisher: 'Journal of Embedded and Digital System Design',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'JEDSD - Journal of Embedded and Digital System Design',
    title: 'JEDSD | Journal of Embedded and Digital System Design',
    description: 'Peer-reviewed journal publishing high-quality research in embedded and digital system design.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JEDSD | Journal of Embedded and Digital System Design',
    description: 'Peer-reviewed journal publishing high-quality research in embedded and digital system design.',
    creator: '@JEDSD',
    site: '@JEDSD',
  },
  verification: {
    google: 'P2Y8X-_uCxmaPSyTZKfeZsv6tULWuEao05ezrbrwsGk', // Replace with actual verification code
    // yandex: 'your-yandex-verification-code', // If needed
    // bing: 'your-bing-verification-code', // If needed
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
  },
};




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body
        className={`antialiased overflow-x-clip w-full max-w-full`}
      >
        <Providers>

        {children}
        </Providers>
      </body>
    </html>
  );
}
