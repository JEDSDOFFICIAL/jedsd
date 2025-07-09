"use client";

import { memo } from "react";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";

export const MemoizedNavbar = memo(Navbar);
export const MemoizedFooter = memo(Footer);
