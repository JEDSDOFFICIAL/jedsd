import { MailIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { aboutus, Policies, PublishingModel } from "./Navbar"; // Adjust path as needed

const footerSections = [
  { title: "About Us", links: aboutus },
  { title: "Policies", links: Policies },
  { title: "Publishing Procedure", links: PublishingModel },
];

function Footer() {
  return (
    <footer className="mt-auto bg-gray-600 w-screen py-10 px-4 sm:px-6 max-w-[99vw] overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
        {/* Brand/Logo */}
        <div className="col-span-full hidden lg:col-span-1 lg:block">
          <Link href="/" className="flex-none font-semibold text-xl text-black" aria-label="Brand">
            <Image src="/logored.jpg" alt="logo" width={100} height={100} />
          </Link>
          <p className="mt-3 text-xs sm:text-sm text-white">© 2025 JEDSD.</p>
        </div>

        {/* Dynamic Sections */}
        {footerSections.map((section) => (
          <div key={section.title}>
            <h4 className="text-xs font-semibold text-gray-900 uppercase">{section.title}</h4>
            <div className="mt-3 grid space-y-3 text-sm">
              {section.links.map((link) => (
                <p key={link.href}>
                  <Link
                    className="inline-flex gap-x-2 text-white hover:text-gray-800 focus:outline-none focus:text-gray-800"
                    href={link.href}
                  >
                    {link.icon && <span className="w-4 h-4">{link.icon}</span>}
                    {link.title}
                  </Link>
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Bottom */}
      <div className="pt-5 mt-5 border-t border-gray-200">
        <div className="sm:flex sm:justify-between sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-x-4 text-sm">
              <Link className="text-white hover:text-gray-800" href="#">
                Terms & Conditions
              </Link>
              <Link className="text-white hover:text-gray-800" href="#">
                Privacy & Safety
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="mt-3 sm:hidden">
              <Link href="/" aria-label="Brand">
                <Image src="/logored.jpg" alt="logo" width={40} height={40} />
              </Link>
              <p className="mt-3 text-xs sm:text-sm text-white">© 2025 JEDSD.</p>
            </div>
            <div className="space-x-4">
              <Link
                className="text-gray-500 hover:text-gray-800"
                href="mailto:jedsdofficial.com"
              >
                <MailIcon />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
