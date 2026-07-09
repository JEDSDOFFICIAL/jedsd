"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  LayoutDashboard,
  LogOut,
  Menu,
  ChevronDown,
  LogOutIcon,
  X,
  UploadCloud,
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
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleDashedIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  aboutus,
  policies,
  publishingModel,
  navSections,
} from "@/components/home/navData";


function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [SearchValue, setSearchValue] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  function onClickSearch(query: string) {
    if (!query.trim()) {
      router.push("/paper");
      return;
    }
    router.push(`/paper?q=${encodeURIComponent(query)}`);
    setSearchValue("");
    setIsSearchOpen(false);
  }

  function handleSearchKeyPress(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      onClickSearch(SearchValue);
    }
  }

  return (
    <nav className="dark relative w-full h-[88px] overflow-visible">
      <div className="h-full max-w-[80rem] w-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 overflow-visible">
        {/* Left: Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group overflow-visible">
          <Image
            src="/logored.jpg"
            alt="JEDSD Logo"
            width={50}
            height={50}
            className="rounded-lg object-contain border border-white/10 group-hover:border-blue-500/50 transition-colors"
          />
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-white tracking-wider uppercase leading-none">
              JEDSD
            </span>
            <span className="text-[10px] text-gray-400 tracking-normal font-medium mt-1.5 leading-none">
              Embedded Systems Journal
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation (No Icons) */}
        <div className="hidden md:flex items-center flex-1 justify-center overflow-visible">
          <NavigationMenu className="static w-fit overflow-visible">
            <NavigationMenuList className="flex items-center gap-1.5 overflow-visible">
              {/* Home */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={<Link href="/">Home</Link>}
                />
              </NavigationMenuItem>

              {/* About Us (using Getting Started w-96 style) */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>About Us</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-96 p-3 flex flex-col gap-1">
                    {aboutus.map((item) => (
                      <ListItem
                        key={item.title}
                        title={item.title}
                        href={item.href}
                      >
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Policies (using Components grid style) */}
              <NavigationMenuItem className="hidden md:flex">
                <NavigationMenuTrigger>Policies</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px] p-3">
                    {policies.map((item) => (
                      <ListItem
                        key={item.title}
                        title={item.title}
                        href={item.href}
                      >
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Publishing Model (using Components grid style) */}
              <NavigationMenuItem className="hidden md:flex">
                <NavigationMenuTrigger>Publishing</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px] p-3">
                    {publishingModel.map((item) => (
                      <ListItem
                        key={item.title}
                        title={item.title}
                        href={item.href}
                      >
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Papers */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={<Link href="/paper">Papers</Link>}
                />
              </NavigationMenuItem>

              {/* Pre-Publish */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={<Link href="/pre-publish">Pre-Publish</Link>}
                />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right: Search + Auth + Mobile Menu */}
        <div className="flex items-center gap-3 flex-shrink-0 overflow-visible">
          {/* Search Bar Expandable */}
          {isSearchOpen ? (
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 animate-in fade-in slide-in-from-right-4 duration-200">
              <Input
                type="text"
                placeholder="Search papers..."
                className="h-8 w-36 sm:w-48 bg-transparent border-0 text-white placeholder:text-gray-400 focus-visible:ring-0 text-xs py-0"
                value={SearchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => onClickSearch(SearchValue)}
              >
                <Search className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchValue("");
                }}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="size-4" />
            </Button>
          )}

          {/* Auth Button / User Account */}
          {session?.user ? (
            <DropdownMenuProfile
              profileImage={session.user.image ?? undefined}
            />
          ) : (
            <Link
              href="/signup"
              className="hidden sm:flex items-center px-4.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
            >
              Create Account
            </Link>
          )}

          {/* Mobile Hamburger menu */}
          <div className="md:hidden">
            <SmNavbar session={session} />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

/* ------------------------------------------------------------------ */
/*  ListItem — restyled for dark dropdowns using render prop            */
/* ------------------------------------------------------------------ */
function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink render={<Link href={href}><div className="flex flex-col gap-1 text-sm">
          <div className="leading-none font-medium text-gray-200">{title}</div>
          <div className="line-clamp-2 text-gray-400 text-xs mt-0.5 leading-relaxed">{children}</div>
        </div></Link>} />
    </li>
  )
}

/* ------------------------------------------------------------------ */
/*  DropdownMenuProfile                                                */
/* ------------------------------------------------------------------ */
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
          className="h-8 w-8 rounded-full ring-2 ring-white/10 hover:ring-blue-500 transition-all object-cover"
          height={32}
          width={32}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 bg-[#0f152d] border border-white/10 text-gray-200"
        align="end"
      >
        <DropdownMenuLabel className="text-gray-400 text-xs">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5 cursor-pointer text-sm">
            <Link href="/dashboard" className="w-full">
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5 cursor-pointer text-sm">
            <Link
              href="/dashboard/paper/upload"
              className="w-full"
            >
              Submit Paper
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="hover:bg-white/5 focus:bg-white/5 cursor-pointer text-sm text-rose-400 focus:text-rose-300"
          onClick={() => signOut()}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/*  SmNavbar — mobile Dialog menu, restyled for dark glassmorphism      */
/* ------------------------------------------------------------------ */
const SmNavbar = ({ session }: { session: any }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-300 hover:text-white hover:bg-white/10"
        >
          <Menu className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen w-screen sm:max-h-screen h-screen overflow-y-auto bg-[#070b19] border-none px-0">
        <DialogHeader className="mt-5 px-6">
          <DialogTitle className="text-white text-lg font-semibold tracking-wide border-b border-white/10 pb-4">
            Journal of Embedded and Digital System Design
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            Navigate through our journal sections
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex flex-col gap-3 px-6 py-6 mx-3 rounded-xl my-3 bg-white/5 backdrop-blur-sm border border-white/10"
        >
          {/* Direct navigation links */}
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-white/10 text-gray-200 text-sm"
            >
              <span className="font-medium">Home</span>
            </Link>
            <Link
              href="/paper"
              className="flex items-center gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-white/10 text-gray-200 text-sm"
            >
              <span className="font-medium">Papers</span>
            </Link>
            <Link
              href="/pre-publish"
              className="flex items-center gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-white/10 text-gray-200 text-sm"
            >
              <span className="font-medium">Pre-Publish</span>
            </Link>
          </div>

          <div className="h-px bg-white/10 my-1" />

          {/* Collapsible sections from navData */}
          {navSections.map((section, index) => (
            <Collapsible key={index}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2.5 text-gray-200 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
                <span>{section.title}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 pt-1 pl-2">
                {section.items.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex items-start gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-white/10 text-gray-300 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-200">
                        {item.title}
                      </span>
                      <span className="text-xs text-gray-500 leading-tight mt-0.5">
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
            <div className="flex flex-col gap-3 w-full">
              <Link href="/dashboard" className="w-full">
                <Button
                  variant="outline"
                  className="w-full bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:text-white"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  signOut();
                  window.location.href = "/";
                }}
              >
                Log Out
              </Button>
            </div>
          ) : (
            <Link href="/signup" className="w-full">
              <Button
                variant="outline"
                className="w-full bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:text-white"
              >
                Submit Paper
              </Button>
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
