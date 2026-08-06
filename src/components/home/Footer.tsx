"use client";

import { Mail, ArrowUpRight, ArrowUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  aboutus,
  policies,
  publishingModel,
} from "@/components/home/navData";

const NAVIGATE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/paper", label: "Papers" },
  { href: "/pre-publish", label: "Pre-Publish" },
  { href: "/dashboard", label: "Dashboard" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-1 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
    >
      <span className="relative">
        {label}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-blue-400 transition-all duration-200 group-hover:w-full" />
      </span>
    </Link>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-4">
        {title}
      </h3>
      <nav className="flex flex-col items-start">{children}</nav>
    </div>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full bg-[#050810]">
      {/* Signature gradient accent line */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-purple-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-16">
        {/* Brand + link columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-12 pb-12">

          {/* Brand block */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <Image
                src="/logored.jpg"
                alt="JEDSD Logo"
                width={52}
                height={52}
                className="h-13 w-13 rounded-md border border-white/10"
              />
              <div className="flex flex-col leading-none">
                <span className="text-base font-extrabold text-white tracking-wide uppercase">
                  JEDSD
                </span>
                <span className="text-[11px] font-medium text-blue-400 tracking-wide uppercase mt-1.5">
                  Embedded Systems Journal
                </span>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              The Journal of Embedded and Digital System Design publishes
              peer-reviewed research advancing embedded, digital, and
              cyber-physical systems.
            </p>

            <Link
              href="mailto:jedsdofficial@gmail.com"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-colors"
            >
              <Mail className="size-3.5" />
              jedsdofficial@gmail.com
            </Link>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <FooterColumn title="Navigate">
              {NAVIGATE_LINKS.map((item) => (
                <FooterLink key={item.href} href={item.href} label={item.label} />
              ))}
            </FooterColumn>

            <FooterColumn title="About">
              {aboutus.map((item) => (
                <FooterLink key={item.href} href={item.href} label={item.title} />
              ))}
            </FooterColumn>

            <FooterColumn title="Policies">
              {policies.map((item) => (
                <FooterLink key={item.href} href={item.href} label={item.title} />
              ))}
            </FooterColumn>

            <FooterColumn title="Publishing">
              {publishingModel.map((item) => (
                <FooterLink key={item.href} href={item.href} label={item.title} />
              ))}
            </FooterColumn>
          </div>
        </div>

        {/* CTA strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 mb-10">
          <div>
            <p className="text-sm font-semibold text-white">
              Have research to share?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Submit your manuscript for peer review.
            </p>
          </div>
          <Link
            href="/dashboard/paper/upload"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-colors flex-shrink-0"
          >
            Submit a Paper
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <p className="text-xs text-gray-500">
            © {year} JEDSD — Journal of Embedded and Digital System Design. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="#"
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="#"
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="mailto:jedsdofficial@gmail.com"
              aria-label="Email JEDSD"
              className="text-gray-500 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
            </Link>
            <button
              type="button"
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center justify-center h-7 w-7 rounded-full border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;