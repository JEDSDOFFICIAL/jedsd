import React from "react";
import {
  Antenna,
  Info,
  UserCog2Icon,
  PhoneCall,
  Book,
  UserLockIcon,
  EthernetPortIcon,
  ConciergeBell,
  UploadCloud,
  Terminal,
  RectangleVertical,
} from "lucide-react";
import { IconBoxModel } from "@tabler/icons-react";

export type NavItem = {
  title: string;
  href: string;
  description: string;
  icon: React.ReactNode;
};

export const aboutus: NavItem[] = [
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

export const policies: NavItem[] = [
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

export const publishingModel: NavItem[] = [
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

export const navSections = [
  { title: "About Us", items: aboutus },
  { title: "Policies", items: policies },
  { title: "Publishing Model", items: publishingModel },
];
