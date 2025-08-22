import { MailIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  Search,
  HamburgerIcon,
  HomeIcon,
  User,
  UserCog2Icon,
  Info,
  Antenna,
  PhoneCall,
  Book,
  UserLockIcon,
  EthernetPortIcon,
  ConciergeBell,
  UploadCloud,
  Terminal,
  RectangleVertical,
  LayoutDashboard,
  LogOut,
  Menu,
  ArrowDownWideNarrow,
  ArrowDown,
  ChevronDown,
  LogOutIcon,
  BookCheck,
} from "lucide-react";
import { IconBoxModel } from "@tabler/icons-react";
const aboutus = [
  {
    title: "Our Mission and Vision",
    href: "/guides/mission-vision",
    description:
      "Learn about our mission to empower creators and our vision for the future.",
    icon: <Antenna />,
  },
  {
    title: "About Us",
    href: "/guides/about-us",
    description:
      "Discover the story behind our platform, our values, and what drives us.",
    icon: <Info />,
  },
  {
    title: "Our Team",
    href: "/guides/our-team",
    description:
      "Meet the talented individuals behind our platform, dedicated to supporting creators.",
    icon: <UserCog2Icon />,
  },
  {
    title: "Contact Us",
    href: "/guides/contact-us",
    description: "Get in touch with us for any inquiries or support.",
    icon: <PhoneCall />,
  },
];

 const Policies = [
  {
    title: "Submission Guidelines",
    href: "/guides/submission-guidelines",
    description:
      "Understand the requirements and guidelines for submitting your work.",
    icon: <Book />,
  },
  {
    title: "Author Guidelines",
    href: "/guides/author-guidelines",
    description: "Learn about the expectations and best practices for authors.",
    icon: <UserLockIcon />,
  },
  {
    title: "Ethical Guidelines",
    href: "/guides/ethical-guidelines",
    description:
      "Understand the ethical responsibilities when creating content.",
    icon: <EthernetPortIcon />,
  },
  {
    title: "Conflict of Interest",
    href: "/guides/conflict-of-interest",
    description:
      "Understand the potential conflicts of interest and how to address them.",
    icon: <ConciergeBell />,
  },
];

 const PublishingModel = [
  {
    title: "Publishing Model",
    href: "/guides/publishing-model",
    description: "Learn about our publishing model.",
    icon: <IconBoxModel />,
  },
  {
    title: "Call for Papers",
    href: "/guides/call-for-papers",
    description: "Check our current call for papers.",
    icon: <Book />,
  },
  {
    title: "How we Publish",
    href: "/guides/how-we-publish",
    description: "Understand our publishing process.",
    icon: <UploadCloud />,
  },
  {
    title: "Templates",
    href: "/guides/templates",
    description: "Explore templates and formatting guidelines.",
    icon: <Terminal />,
  },
  {
    title: "Peer Review Process",
    href: "/guides/peer-review-process",
    description: "Learn how peer review ensures quality.",
    icon: <RectangleVertical />,
  },
];


function Footer() {
 
  
  return (
    <footer className="mt-auto w-full overflow-hidden border-t-4 border-primary bg-gradient-to-br from-gray-900 via-gray-800 to-primary/30 px-0 py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-10">
          {/* Brand/Logo */}
          <div className="flex flex-col items-center lg:items-start justify-center">
            <Link href="/" className="flex-none font-bold text-2xl text-primary drop-shadow-lg" aria-label="Brand">
              <Image src="/logored.jpg" alt="logo" width={100} height={100} className="rounded-xl shadow-lg" />
            </Link>
            <p className="mt-3 text-xs sm:text-sm text-gray-300">© 2025 JEDSD. All rights reserved.</p>
          </div>

          {/* Dynamic Sections */}
          <div className="flex flex-1 justify-between flex-wrap gap-8 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-gray-900/10 shadow-md">
            {/* Navigation Section */}
            <div>
              <h4 className="text-sm font-bold text-red-200 uppercase tracking-wide mb-2">Navigation</h4>
              <div className="mt-3 grid space-y-3 text-base">
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-primary transition-colors duration-150 focus:outline-none focus:text-primary"
                    href="/paper"
                  >
                    <Search className="size-4 text-primary" />
                    Papers
                  </Link>
                </p>
                <p>
                  <Link
                    className="inline-flex gap-x-2 text-gray-200 hover:text-primary transition-colors duration-150 focus:outline-none focus:text-primary"
                    href="/pre-publish"
                  >
                    <BookCheck className="size-4 text-primary" />
                    Pre-Publish
                  </Link>
                </p>
              </div>
            </div>

            {['about us', 'Policies', 'Publishing Procedure'].map((section, idx) => (
              <div key={section}>
                <h4 className={`text-sm font-bold uppercase tracking-wide mb-2 ${idx === 0 ? 'text-blue-400' : idx === 1 ? 'text-green-400' : 'text-purple-400'}`}>{section}</h4>
                <div className="mt-3 grid space-y-3 text-base">
                  {(section === "about us" ? aboutus : section === "Policies" ? Policies : PublishingModel).map((link) => (
                    <p key={link.href}>
                      <Link
                        className="inline-flex gap-x-2 text-gray-200 hover:text-primary transition-colors duration-150 focus:outline-none focus:text-primary"
                        href={link.href}
                      >
                        {link.icon && <span className="inline-block text-primary/80">{link.icon}</span>}
                        {link.title}
                      </Link>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 mt-6 border-t border-primary/30">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-x-4 text-sm">
                <Link className="text-gray-400 hover:text-primary transition-colors duration-150" href="#">
                  Terms & Conditions
                </Link>
                <Link className="text-gray-400 hover:text-primary transition-colors duration-150" href="#">
                  Privacy & Safety
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="mt-3 sm:hidden">
                <Link href="/" aria-label="Brand">
                  <Image src="/logored.jpg" alt="logo" width={40} height={40} className="rounded-lg shadow" />
                </Link>
                <p className="mt-3 text-xs sm:text-sm text-gray-300">© 2025 JEDSD.</p>
              </div>
              <div className="space-x-4">
                <Link
                  className="text-primary hover:text-blue-400 transition-colors duration-150"
                  href="mailto:jedsdofficial.com"
                >
                  <MailIcon className="w-5 h-5" />
                </Link>
                {/* Add more social/contact icons here if needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
