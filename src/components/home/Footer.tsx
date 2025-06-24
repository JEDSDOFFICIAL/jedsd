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

const footerSections = [
  { title: "About Us", links: aboutus },
  { title: "Policies", links: Policies },
  { title: "Publishing Procedure", links: PublishingModel },
];

function Footer() {
 
  
  return (
    <footer className="mt-auto bg-gray-600 w-screen py-10 px-4 sm:px-6 max-w-screen overflow-hidden">
      <div className="flex gap-6 mb-10">
        {/* Brand/Logo */}
        <div className="hidden lg:block">
          <Link href="/" className="flex-none font-semibold text-xl text-black" aria-label="Brand">
            <Image src="/logored.jpg" alt="logo" width={100} height={100} />
          </Link>
          <p className="mt-3 text-xs sm:text-sm text-white">© 2025 JEDSD.</p>
        </div>

        {/* Dynamic Sections */}
        <div className="flex flex-1 justify-between flex-wrap gap-6 p-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold text-gray-900 uppercase">{section.title}</h4>
              <div className="mt-3 grid space-y-3 text-sm">
                {(section.links || []).map((link) => (
                  <p key={link.href}>
                    <Link
                      className="inline-flex gap-x-2 text-white hover:text-gray-800 focus:outline-none focus:text-gray-800"
                      href={link.href}
                    >
                      {link.icon && <span className="inline-block">{link.icon}</span>}
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
