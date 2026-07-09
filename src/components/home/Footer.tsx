import { MailIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  aboutus,
  policies,
  publishingModel,
} from "@/components/home/navData";

function Footer() {
  return (
    <footer className="mt-auto w-full bg-[#050810]">
      {/* Top gradient accent line */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-purple-500" />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-8">
        {/* Top row: Logo + Journal info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-12">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logored.jpg"
              alt="JEDSD Logo"
              width={80}
              height={80}
              className="rounded-xl"
            />
          </Link>
          <div className="text-center sm:text-left">
            <h2
              className="text-xl text-white font-normal"
              style={{ fontFamily: "'Chicle', cursive" }}
            >
              Journal of Embedded and Digital System Design
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Advancing research in embedded and digital technologies
            </p>
          </div>
        </div>

        {/* Columns row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <nav className="flex flex-col">
              <Link
                href="/"
                className="block py-1.5 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Home
              </Link>
              <Link
                href="/paper"
                className="block py-1.5 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Papers
              </Link>
              <Link
                href="/pre-publish"
                className="block py-1.5 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Pre-Publish
              </Link>
              <Link
                href="/dashboard"
                className="block py-1.5 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              About
            </h3>
            <nav className="flex flex-col">
              {aboutus.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-1.5 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Policies
            </h3>
            <nav className="flex flex-col">
              {policies.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-1.5 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Publishing */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Publishing
            </h3>
            <nav className="flex flex-col">
              {publishingModel.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-1.5 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2025 JEDSD. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="#"
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="mailto:jedsdofficial@gmail.com"
              className="text-gray-500 hover:text-white transition-colors ml-2"
            >
              <MailIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
