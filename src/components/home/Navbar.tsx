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
} from "@/components/ui/navigation-menu";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const currentScroll = window.scrollY;
      if (currentScroll > 80) {
        setIsScrolled(true);
      } else if (currentScroll < 20) {
        setIsScrolled(false);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <nav className="relative w-full overflow-visible bg-transparent">
      <div className="max-w-[80rem] w-full mx-auto px-4 sm:px-6 overflow-visible">

        {/* ── Desktop layout ── */}
        <div className="hidden md:flex items-center gap-6 overflow-visible py-1">

          {/* Left: Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group select-none">
            <Image
              src="/logored.jpg"
              alt="JEDSD Logo"
              width={65}
              height={65}
              className={`rounded-lg object-contain border border-slate-200 group-hover:border-blue-500 transition-all duration-300 ${
                isScrolled ? "h-9 w-9" : "h-[65px] w-[65px]"
              }`}
            />
          </Link>

          {/* Right: Two stacked rows taking remaining width */}
          <div className="flex flex-col justify-center flex-1 overflow-visible min-w-0">

            {/* Row 1: Navigation links + auth */}
            <div className="flex items-center w-full overflow-visible">
              <NavigationMenu className={`static flex-1 overflow-visible ${isScrolled ? "justify-center" : "justify-start"}`}>
                <NavigationMenuList className="flex items-center gap-1 overflow-visible">
                  {/* Home */}
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className="bg-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors font-semibold text-sm px-3.5 py-1.5 rounded-md block cursor-pointer select-none"
                      render={<Link href="/">Home</Link>}
                    />
                  </NavigationMenuItem>

                  {/* About Us */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-slate-50 focus:bg-transparent data-[state=open]:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors font-semibold text-sm px-3.5 py-1.5 shadow-none border-none cursor-pointer select-none">
                      About Us
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="w-96 p-3 flex flex-col gap-1 bg-white border border-slate-250 rounded-xl shadow-xl">
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

                  {/* Policies */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-slate-50 focus:bg-transparent data-[state=open]:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors font-semibold text-sm px-3.5 py-1.5 shadow-none border-none cursor-pointer select-none">
                      Policies
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px] p-3 bg-white border border-slate-250 rounded-xl shadow-xl">
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

                  {/* Publishing */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-slate-50 focus:bg-transparent data-[state=open]:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors font-semibold text-sm px-3.5 py-1.5 shadow-none border-none cursor-pointer select-none">
                      Publishing
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px] p-3 bg-white border border-slate-250 rounded-xl shadow-xl">
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
                      className="bg-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors font-semibold text-sm px-3.5 py-1.5 rounded-md block cursor-pointer select-none"
                      render={<Link href="/paper">Papers</Link>}
                    />
                  </NavigationMenuItem>

                  {/* Pre-Publish */}
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className="bg-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors font-semibold text-sm px-3.5 py-1.5 rounded-md block cursor-pointer select-none"
                      render={<Link href="/pre-publish">Pre-Publish</Link>}
                    />
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* Auth */}
              {session?.user ? (
                <DropdownMenuProfile
                  profileImage={session.user.image ?? undefined}
                />
              ) : (
                <Link
                  href="/signup"
                  className="flex items-center px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
                >
                  Create Account
                </Link>
              )}
            </div>

            {/* Row 2: Search bar — full width, hides on scroll */}
            <div
              className={`w-full transition-all duration-300 ease-in-out overflow-hidden ${
                isScrolled
                  ? "max-h-0 opacity-0 mt-0"
                  : "max-h-16 opacity-100 mt-2.5"
              }`}
            >
              <div className="flex items-center w-full bg-slate-100/80 border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <Input
                  type="text"
                  placeholder="Search papers by title, abstract, keywords, or authors..."
                  className="h-9 flex-1 bg-transparent border-0 text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 text-xs px-4"
                  value={SearchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                />
                <Button
                  type="button"
                  className="h-9 px-5 rounded-none bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 border-l border-slate-200 flex-shrink-0"
                  onClick={() => onClickSearch(SearchValue)}
                >
                  <Search className="size-3.5" />
                  <span>Search</span>
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Mobile layout ── */}
        <div className="md:hidden flex items-center justify-between w-full gap-4 py-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logored.jpg"
              alt="JEDSD Logo"
              width={40}
              height={40}
              className="rounded-lg object-contain border border-slate-200"
            />
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-800 tracking-wider uppercase leading-none">
                JEDSD
              </span>
              <span className="text-[8px] text-slate-500 tracking-normal font-medium mt-1 leading-none">
                Embedded Systems Journal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Mobile Expandable Search Bar */}
            {isSearchOpen ? (
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 animate-in fade-in slide-in-from-right-4 duration-200">
                <Input
                  type="text"
                  placeholder="Search papers..."
                  className="h-8 w-28 sm:w-44 bg-transparent border-0 text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 text-xs py-0"
                  value={SearchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  onClick={() => onClickSearch(SearchValue)}
                >
                  <Search className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
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
                className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="size-4" />
              </Button>
            )}

            {/* Profile Dropdown on Mobile */}
            {session?.user && (
              <DropdownMenuProfile
                profileImage={session.user.image ?? undefined}
              />
            )}

            {/* Mobile Hamburger menu */}
            <SmNavbar session={session} />
          </div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;

/* ------------------------------------------------------------------ */
/*  ListItem — restyled for light dropdowns using render prop           */
/* ------------------------------------------------------------------ */
function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink render={<Link href={href}><div className="flex flex-col gap-1 text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
          <div className="leading-none font-semibold text-slate-800">{title}</div>
          <div className="line-clamp-2 text-slate-500 text-xs mt-0.5 leading-relaxed">{children}</div>
        </div></Link>} />
    </li>
  );
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
          className="h-8 w-8 rounded-full ring-2 ring-slate-200 hover:ring-blue-500 transition-all object-cover"
          height={32}
          width={32}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 bg-white border border-slate-200 text-slate-800"
        align="end"
      >
        <DropdownMenuLabel className="text-slate-400 text-xs">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer text-sm">
            <Link href="/dashboard" className="w-full">
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer text-sm">
            <Link
              href="/dashboard/paper/upload"
              className="w-full"
            >
              Submit Paper
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-100" />
        <DropdownMenuItem
          className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer text-sm text-rose-600 focus:text-rose-500"
          onClick={() => signOut()}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/*  SmNavbar — mobile Dialog menu                                      */
/* ------------------------------------------------------------------ */
const SmNavbar = ({ session }: { session: any }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <Menu className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen w-screen sm:max-h-screen h-screen overflow-y-auto bg-white border-none px-0">
        <DialogHeader className="mt-5 px-6">
          <DialogTitle className="text-slate-900 text-lg font-bold tracking-wide border-b border-slate-150 pb-4">
            Journal of Embedded and Digital System Design
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            Navigate through our journal sections
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex flex-col gap-3 px-6 py-6 mx-3 rounded-xl my-3 bg-slate-50 border border-slate-200"
        >
          {/* Direct navigation links */}
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-slate-100 text-slate-700 text-sm"
            >
              <span className="font-medium">Home</span>
            </Link>
            <Link
              href="/paper"
              className="flex items-center gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-slate-100 text-slate-700 text-sm"
            >
              <span className="font-medium">Papers</span>
            </Link>
            <Link
              href="/pre-publish"
              className="flex items-center gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-slate-100 text-slate-700 text-sm"
            >
              <span className="font-medium">Pre-Publish</span>
            </Link>
          </div>

          <div className="h-px bg-slate-200 my-1" />

          {/* Collapsible sections from navData */}
          {navSections.map((section, index) => (
            <Collapsible key={index}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2.5 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors">
                <span>{section.title}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 pt-1 pl-2">
                {section.items.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex items-start gap-2.5 rounded-lg p-2.5 transition-colors hover:bg-slate-100 text-slate-600 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">
                        {item.title}
                      </span>
                      <span className="text-xs text-slate-500 leading-tight mt-0.5">
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
                  className="w-full bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
                className="w-full bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
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
