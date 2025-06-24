import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import { User2, WorkflowIcon } from "lucide-react";
import "react-vertical-timeline-component/style.min.css";

// Your onboarding data
const data = [
  {
    title: "Create Your Account",
    description:
      "Sign up for free to begin publishing your research journals and articles on our platform.",
    button: "Sign Up",
    link: "/signup",
    image: "/onboarding/signup.jpg",
    icon:<User2/>
  },
  {
    title: "Prepare and Submit",
    description:
      "Upload your well-researched articles through our easy and intuitive submission process.",
    button: "Submit Now",
    link: "/signup",
    image: "/images/onboarding/submit.png",
    icon:<User2/>
  },
  {
    title: "Expert Peer Review",
    description:
      "Each submission undergoes a detailed peer review by domain experts to maintain quality and accuracy.",
    button: "Learn About Review",
    link: "/signup",
    image: "/images/onboarding/review.png",
    icon:<User2/>
  },
  {
    title: "Get Published",
    description:
      "After approval, your article will be published and made available to readers worldwide.",
    button: "View Publishing Guide",
    link: "/signup",
    image: "/images/onboarding/publish.png",
    icon:<User2/>
  },
  {
    title: "Share Your Work",
    description:
      "Reach a wider audience by sharing your published research across academic and professional networks.",
    button: "Start Sharing",
    link: "/signup",
    image: "/images/onboarding/share.png",
    icon:<User2/>
  },
];

export default function Timeline() {
  return (
    <div className="w-full min-h-screen py-10 px-4 md:px-10 lg:px-16 bg-white">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12">
        Submission Steps
      </h1>

      <VerticalTimeline>
        {data.map((item, index) => (
          <VerticalTimelineElement
            key={index}
            contentStyle={{
              background: "#1d4ed8",
              color: "#fff",
              padding: 0,
              overflow: "hidden",
            }}
            contentArrowStyle={{ borderRight: "7px solid #1d4ed8" }}
            iconStyle={{ background: "#1d4ed8", color: "#fff" }}
            icon={item.icon}
          >
            <Card className="relative h-[300px]   group rounded-lg overflow-hidden">
              <div
                className="absolute inset-0 bg-black bg-opacity-50 z-10 group-hover:bg-opacity-60 bg-cover bg-no-repeat bg-center group-hover:scale-110 transition-all duration-500"
                style={{
                  backgroundImage: `url(${item.image})`,
                }}
              />
              <CardContent className="relative z-20 h-full flex flex-col justify-end  text-white">
                <h3 className="text-2xl font-bold mb-2 text-white ">{item.title}</h3>
                <h5 className="text-base mb-5">{item.description}</h5>
                <Link href={item.link}>
                  <Button variant="secondary" className="w-max">
                    {item.button}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </div>
  );
}
