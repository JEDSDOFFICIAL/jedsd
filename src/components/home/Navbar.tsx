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
  Home,
  FileText,
  Clock3,
  BookOpen,
  ShieldCheck,
  Newspaper,
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

/* Small icon set cycled across the collapsible sections in the mobile
   drawer, purely decorative/wayfinding — swap or extend as sections grow. */
const SECTION_ICONS = [BookOpen, ShieldCheck, Newspaper];

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
    <nav className="relative w-full overflow-visible bg-gray-200/70">
      <div className="max-w-[80rem] w-full mx-auto px-4 sm:px-6 overflow-visible">

        {/* ── Desktop layout (unchanged) ── */}
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

        {/* ── Mobile layout (redesigned) ── */}
        <div className="md:hidden">
          <div className="flex items-center justify-between w-full gap-3 py-2.5">
            {/* Logo + wordmark */}
            <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
              <Image
                src="/logored.jpg"
                alt="JEDSD Logo"
                width={38}
                height={38}
                className="h-9 w-9 rounded-lg object-contain border border-slate-200 flex-shrink-0"
              />
              <div className="flex flex-col min-w-0 leading-none">
                <span className="text-[13px] font-extrabold text-slate-900 tracking-wide uppercase truncate">
                  JEDSD
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-1 truncate">
                  Embedded Systems Journal
                </span>
              </div>
            </Link>

            {/* Action cluster: search / profile / menu */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {!isSearchOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open search"
                  className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="size-[18px]" />
                </Button>
              )}

              {session?.user && !isSearchOpen && (
                <>
                  <div className="w-px h-5 bg-slate-200 mx-1" />
                  <DropdownMenuProfile
                    profileImage={session.user.image ?? undefined}
                  />
                </>
              )}

              {!isSearchOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full ml-0.5"
                  onClick={() => document.getElementById("mobile-menu-trigger")?.click()}
                >
                  <Menu className="size-[19px]" />
                </Button>
              )}
              {/* Hidden real trigger so the Dialog wiring stays untouched */}
              <span className="hidden">
                <SmNavbar session={session} />
              </span>
            </div>
          </div>

          {/* Expandable search row — slides open in place of the icon row */}
          {isSearchOpen && (
            <div className="flex items-center gap-2 pb-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center flex-1 bg-slate-100/80 border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <Search className="size-4 text-slate-400 ml-3 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Search papers, authors, keywords..."
                  className="h-10 flex-1 bg-transparent border-0 text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 text-sm px-2.5"
                  value={SearchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  autoFocus
                />
              </div>
              <Button
                type="button"
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex-shrink-0"
                onClick={() => onClickSearch(SearchValue)}
              >
                Go
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close search"
                className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl flex-shrink-0"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchValue("");
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          <div className="h-px bg-slate-100" />
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
            <Link href="/dashboard" className="w-full flex items-center gap-2">
              <LayoutDashboard className="size-3.5 text-slate-400" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer text-sm">
            <Link
              href="/dashboard/paper/upload"
              className="w-full flex items-center gap-2"
            >
              <UploadCloud className="size-3.5 text-slate-400" />
              Submit Paper
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-100" />
        <DropdownMenuItem
          className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer text-sm text-rose-600 focus:text-rose-500 flex items-center gap-2"
          onClick={() => signOut()}
        >
          <LogOut className="size-3.5" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/*  SmNavbar — mobile menu, now a right-anchored drawer                */
/* ------------------------------------------------------------------ */

const MOBILE_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/paper", label: "Papers", icon: FileText },
  { href: "/pre-publish", label: "Pre-Publish", icon: Clock3 },
];

const SmNavbar = ({ session }: { session: any }) => {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Real trigger — kept off-screen; the visible menu button in the
            navbar row above forwards its click here via id lookup. */}
        <button id="mobile-menu-trigger" aria-hidden className="hidden" />
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="fixed inset-y-0 left-auto right-0 top-0 h-dvh max-h-dvh w-[88%] max-w-sm translate-x-0 translate-y-0 !rounded-none rounded-l-2xl border-l border-slate-200 bg-white p-0 shadow-2xl gap-0 flex flex-col overflow-hidden data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
      >
        {/* Header */}
        <DialogHeader className="flex-shrink-0 border-b border-slate-100 px-5 py-4 space-y-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Image
                src="/logored.jpg"
                alt="JEDSD Logo"
                width={34}
                height={34}
                className="h-8 w-8 rounded-lg object-contain border border-slate-200 flex-shrink-0"
              />
              <div className="flex flex-col min-w-0 leading-none">
                <DialogTitle className="text-slate-900 text-[13px] font-bold tracking-wide truncate">
                  JEDSD
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-[10px] mt-1 truncate">
                  Journal of Embedded &amp; Digital System Design
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={closeMenu}
              aria-label="Close menu"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Scrollable nav body */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Primary links */}
          <div className="space-y-0.5 mb-4">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Navigate
            </p>
            {MOBILE_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-700 text-sm font-medium hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  <Icon className="size-4" />
                </span>
                {label}
              </Link>
            ))}
          </div>

          <div className="h-px bg-slate-100 mx-1 mb-4" />

          {/* Collapsible sections from navData */}
          <div className="space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Explore
            </p>
            {navSections.map((section, index) => {
              const SectionIcon = SECTION_ICONS[index % SECTION_ICONS.length];
              return (
                <Collapsible key={index}>
                  <CollapsibleTrigger className="group w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                        <SectionIcon className="size-4" />
                      </span>
                      {section.title}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 pt-1 pl-11 pr-1">
                    {section.items.map((item, i) => (
                      <Link
                        key={i}
                        href={item.href}
                        onClick={closeMenu}
                        className="flex flex-col gap-0.5 rounded-lg px-3 py-2 hover:bg-slate-50 active:bg-slate-100 transition-colors border-l border-slate-100"
                      >
                        <span className="text-[13px] font-semibold text-slate-800">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                          {item.description}
                        </span>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <DialogFooter className="flex-shrink-0 border-t border-slate-100 px-5 py-4">
          {session?.user ? (
            <div className="flex flex-col gap-2 w-full">
              <Link href="/dashboard" className="w-full" onClick={closeMenu}>
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <LayoutDashboard className="size-3.5" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="w-full justify-center gap-2"
                onClick={() => {
                  closeMenu();
                  signOut();
                  window.location.href = "/";
                }}
              >
                <LogOut className="size-3.5" />
                Log Out
              </Button>
            </div>
          ) : (
            <Link href="/signup" className="w-full" onClick={closeMenu}>
              <Button className="w-full justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/10">
                <UploadCloud className="size-3.5" />
                Create Account
              </Button>
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};