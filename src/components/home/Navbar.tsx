"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { signOut, useSession } from "next-auth/react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { IconBoxModel } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

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

function Navbar() {
  

  const { data: session } = useSession();
  const router = useRouter();
  const [SearchValue, setSearchValue] = useState("");
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
  function onClickSearch(query: string) {
    if (!query.trim()) return;
    router.push(`/paper?titles=${encodeURIComponent(query)}`);
  }

  return (
    <div className="w-full h-fit fixed top-0 z-50 bg-white shadow-md">
      <header className="bg-gray-600 text-white w-full px-4 py-2 flex justify-between items-center lg:h-36 md:h-24 h-20 ">
        <div className="flex items-center gap-4 w-full h-full">
          <Image
            src="/logored.jpg"
            alt="Logo"
            width={100}
            height={100}
            className="h-full w-auto"
          />
          <div className="flex flex-col w-full h-full md:justify-center md:items-center">
            <div className="flex items-center justify-end md:hidden h-full gap-4">
              <DropdownMenuProfile profileImage={session?.user?.image ?? undefined} />
              <Link href="/paper" className="text-white font-semibold text-lg">
              <Search/></Link>
              <SmNavbar session={session} />
            </div>
            <div className="w-full lg:h-1/2 hidden md:block bg-white border-2 border-black rounded-md py-1">
              <NavigationMenuDemo session={session} />
            </div>
            <div className="w-full lg:h-1/2 hidden lg:flex gap-3 py-1">
              <Input
                type="text"
                placeholder="Search..."
                className="w-full h-full bg-white text-black"
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <Button
                className="h-full text-black"
                variant="outline"
                onClick={() => onClickSearch(SearchValue)}
              >
                <Search className="mr-1" /> Search
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full h-16 flex items-center gap-4 p-2 lg:hidden ">
        <Input
          type="text"
          placeholder="Search..."
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full h-full bg-white text-black"
        />
        <Button
          className="h-full text-black"
          variant="outline"
          onClick={() => onClickSearch(SearchValue)}
        >
          <Search className="mr-1" /> Search
        </Button>
      </div>
    </div>
  );
}

export default Navbar;

function NavigationMenuDemo({ session }: { session: any }) {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <NavigationMenu viewport={false} className="w-full h-fit px-6">
        <NavigationMenuList className="w-full h-full flex items-center justify-between text-black">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/">
                <div className="flex items-center gap-2 text-black font-medium">
                  <HomeIcon className="size-6 text-black" /> Home
                </div>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <div className="flex items-center gap-4">
            <NavigationMenuItem>
              <NavigationMenuTrigger>About Us</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] md:w-[500px] lg:w-[600px] md:grid-cols-2 gap-2">
                  {aboutus.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                      icon={item.icon}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Policies</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] md:w-[500px] lg:w-[600px] md:grid-cols-2 gap-2">
                  {Policies.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                      icon={item.icon}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Publishing Model</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] md:w-[500px] lg:w-[600px] md:grid-cols-2 gap-2">
                  {PublishingModel.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                      icon={item.icon}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/paper">
                  <div className="flex items-center gap-2 text-black font-medium">
                    <Search className="size-6 text-black" /> Paper
                  </div>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </div>

          {session?.user ? (
            <NavigationMenuItem className="h-fit w-fit">
              <DropdownMenuProfile
                profileImage={session.user.image}
              />
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/signup">
                  <div className="flex items-center gap-2 text-black font-medium">
                    <User className="size-6 text-black" /> Sign-Up
                  </div>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

function ListItem({
  title,
  children,
  href,
  icon,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href} className="block">
          <div className="flex items-center gap-2">
            {icon}
            <div className="font-medium text-sm">{title}</div>
          </div>
          <p className="text-sm leading-snug text-muted-foreground line-clamp-2">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

function DropdownMenuProfile({
  profileImage,

}: {
  profileImage?: string;

}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Image
          src={profileImage || "/default-image.jpg"}
          alt="Profile Image"
          className="h-7 w-7 md:h-10 md:w-10 rounded-full"
          height={100}
          width={100}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href={`/dashboard`} className="flex items-center gap-2">
              <LayoutDashboard /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              href={`/dashboard/paper/upload`}
              className="flex items-center gap-2"
            >
              <UploadCloud /> Upload a Paper
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const sections = [
  { title: "About Us", items: aboutus },
  { title: "Policies", items: Policies },
  { title: "Publishing Model", items: PublishingModel },
];
const SmNavbar = ({ session }: { session: any }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Menu className="cursor-pointer text-white size-6" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen w-screen sm:max-h-screen h-screen overflow-y-auto bg-[#7e0d0c] border-none px-0">
        <DialogHeader className="mt-5 px-6">
          <DialogTitle className="text-white text-lg font-semibold tracking-wide border-b border-white py-6">
            Journal of Embedded and Digital System Design
          </DialogTitle>
        </DialogHeader>

        <div
          className="flex flex-col gap-4 px-6 py-9 mx-2 rounded-md my-3 shadow-2xl shadow-blue-500/20"
          style={{
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
          }}
        >
          {sections.map((section, index) => (
            <Collapsible key={index}>
              <CollapsibleTrigger className="w-full border-b border-r border-white shadow-md shadow-white flex items-center justify-between px-3 py-2 text-white text-lg font-medium">
                <span>{section.title}</span>
                <ChevronDown className="h-5 w-5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2 pl-2">
                {section.items.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex items-start gap-2 rounded-md p-2 transition-colors hover:bg-white/10 text-white text-sm"
                  >
                    {item.icon}
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-white/70 leading-tight">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <DialogFooter className="px-6 py-4">
          {session?.user ? (
            <div className="flex flex-col gap-4">
              <Link href={`/dashboard`}>
                <Button variant="outline" className="text-black font-medium w-full">
                  <BookCheck className="size-5" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="text-black font-medium"
                onClick={() => {
                  signOut();
                  window.location.href = "/";
                }}
              >
                <LogOutIcon className="size-5" />
                Log Out
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="text-black font-medium">
              <Link href="/signup" className="flex items-center gap-2">
                <User className="size-5" />
                Sign-Up
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
