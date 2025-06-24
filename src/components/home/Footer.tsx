import { MailIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <footer className="mt-auto  bg-gray-600 w-screen py-10 px-4 sm:px-6 max-w-[99vw] overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
        <div className="col-span-full hidden lg:col-span-1 lg:block">
          <a
            className="flex-none font-semibold text-xl text-black focus:outline-none focus:opacity-80"
            href="#"
            aria-label="Brand"
          >
            <Image src={'/logored.jpg'} alt="logo" width={100} height={100}/>
          </a>
          <p className="mt-3 text-xs sm:text-sm text-white">
            © 2025 JEDSD .
          </p>
        </div>

        <div>
          <Link href={"/aboutus"} className="text-xs font-semibold text-gray-900 uppercase">
            About  Us
          </Link>

          <div className="mt-3 grid space-y-3 text-sm">
            <p>
              <Link
                className="inline-flex gap-x-2 text-white hover:text-gray-800 focus:outline-none focus:text-gray-800"
                href={"/team"}
              >
                Our Team
              </Link>
            </p>
            <p>
              <Link
                className="inline-flex gap-x-2 text-white hover:text-gray-800 focus:outline-none focus:text-gray-800"
                href={"/mission"}
              >
                Our Mission and Vission
              </Link>
            </p>
           
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase">
            News and Announcement
          </h4>

          <div className="mt-3 grid space-y-3 text-sm">
          
            <p>
              <Link
                className="inline-flex gap-x-2 text-white hover:text-gray-800 focus:outline-none focus:text-gray-800"
                href="/callforpapers"
              >
                Call for Papers
              </Link>{" "}
              
            </p>
            <Link href={"/ethicalcons"} className=" text-white hover:text-black transition-all delay-100 cursor-pointer">
              Ethical Considerations
            </Link>
            <Link href={"/conflictofinterest"} className=" text-white hover:text-black transition-all delay-100 cursor-pointer">
              Conflict of Interest
            </Link>
           
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase">
            Publishing Procedure
          </h4>

          <div className="mt-3 grid space-y-3 text-sm">
            <p>
              <Link
                className="inline-flex gap-x-2 text-white hover:text-gray-800 focus:outline-none focus:text-gray-800"
                href="/publishingmodel"
              >
                Publishing Model
              </Link>
            </p>
            <p>
              <a
                className="inline-flex gap-x-2 text-white hover:text-gray-800 focus:outline-none focus:text-gray-800"
                href="#"
              >
                Community
              </a>
            </p>
           
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase">
            Policies
          </h4>

          <div className="mt-3 grid space-y-3 text-sm">
            <p>
              <Link
                className="inline-flex gap-x-2 text-white hover:text-gray-800 focus:outline-none focus:text-gray-800"
                href="/authorguideline"
              >
                Author Policies
              </Link>
            </p>
           
            
          </div>

         
        </div>
      </div>

      <div className="pt-5 mt-5 border-t border-gray-200">
        <div className="sm:flex sm:justify-between sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            
            <div className="space-x-4 text-sm">
              <a
                className="inline-flex gap-x-2 text-white hover:text-gray-800 focus:outline-none focus:text-gray-800"
                href="#"
              >
                Terms & Conditions
              </a>
              <a
                className="inline-flex gap-x-2 text-white hover:text-gray-800 focus:outline-none focus:text-gray-800"
                href="#"
              >
                Privacy & Safety
              </a>
              
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="mt-3 sm:hidden">
            <a
            className="flex-none font-semibold text-xl text-black focus:outline-none focus:opacity-80"
            href="/"
            aria-label="Brand"
          >
            <Image src={'/logored.jpg'} alt="logo" width={40} height={40}/>
          </a>
          <p className="mt-3 text-xs sm:text-sm text-white">
            © 2025 JEDSD .
          </p>
            </div>

            <div className="space-x-4">
              <a
                className="inline-block text-gray-500 hover:text-gray-800 focus:outline-none focus:text-gray-800"
                href="mailto:jedsdofficial.com"
              >
               <MailIcon/>
              </a>
             
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;