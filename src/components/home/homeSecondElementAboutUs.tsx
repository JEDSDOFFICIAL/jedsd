// components/HomeSecondElementAboutUs.jsx
import Image from "next/image";
import React from "react";
import { Fade } from "react-awesome-reveal";

function HomeSecondElementAboutUs() {
  return (
    <div className="w-full min-h-screen h-fit md:p-10 lg:p-14 py-0 flex flex-col justify-between items-center p-3">
      <div
        className="chicle-regular flex flex-col items-center rounded-md lg:p-9 p-3 text-justify justify-center w-full md:text-xl text-sm gap-6 h-fit"
        style={{
          boxShadow:
            " rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
        }}
      >
        <h2 className="md:text-6xl text-4xl text-black font-bold">About Us</h2>
        <p>
          Welcome to the Journal of Embedded and Digital System Design (JEDSD),
          a pioneering platform dedicated to advancing the fields of embedded
          and digital system design. At JEDSD, we aim to bridge the gap between
          innovation and application by providing cutting-edge solutions through
          insightful research, and expert analysis.. Our mission is to empower
          professionals, researchers, and enthusiasts with the knowledge they
          need to thrive in the ever-evolving world of embedded and digital
          systems. From exploring the latest trends to sharing industry best
          practices, JEDSD is your trusted source for all things related to
          digital and embedded systems. Join us to make it a best knowledge
          sharing platform that can pave the way for revolutionary technologies.
        </p>
        <Carousel />
      </div>
    </div>
  );
}

export default HomeSecondElementAboutUs;
import { data } from "./timeline";


import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel as UICarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "../ui/button";
import Link from "next/link";
export function Carousel() {
  return (
    <UICarousel
      opts={{ align: "start" }}
      className="w-[95%] mx-auto h-fit"
      plugins={
        [
          // Autoplay({
          //   delay: 4000,
          //   stopOnInteraction: false,
          // }),
        ]
      }
    >
      <CarouselContent className="-ml-2">
        {data.map((item, index) => (
          <CarouselItem
            key={index}
            className="md:basis-1/2 lg:basis-1/3 px-2 group"
            
          >
            <Card className="relative h-[350px] overflow-hidden rounded-2xl shadow-lg group card">
              <div className="absolute inset-0 bg-black bg-opacity-50 z-10 group-hover:bg-opacity-60 bg-cover bg-no-repeat bg-center group-hover:scale-150 duration-500 transition-all"  style={{
                  backgroundImage: `url(${item.image})`,
                }}/>
              <CardContent className="relative z-20 h-full flex flex-col justify-end  text-white ">
                <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
                <p className="text-lg mb-4">
                  {item.description}
                </p>
                <Link href={item.link}>
                <Button variant="secondary" className="w-max">
                  {item.button}
                </Button>
                </Link>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="ml-2" />
      <CarouselNext className="mr-2" />
    </UICarousel>
  );
}
