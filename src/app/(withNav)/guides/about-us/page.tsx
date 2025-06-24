'use client'

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <div className="w-full flex justify-center items-center bg-gray-200 min-h-screen h-fit">

    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-6 w-[99%] md:w-[80%] lg:pt-36 md:pt-40 pt-36 "
    >
      <Card className=" bg-white shadow-lg rounded-2xl p-6">
        <CardContent>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            About Us
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            A nation’s dream is to build a ubiquitous digital infrastructure,
            ensuring ease of living for its people. Growth in digital
            infrastructure relies on secure, fast, and reliable digital hardware
            platforms. Innovative techniques are crucial for developing
            cost-effective yet high-performing embedded or digital systems.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            <strong>Journal of Embedded and Digital System Design (JEDSD)</strong> is
            an open-access journal providing a platform for researchers to
            publish emerging techniques in embedded and digital system design.
            The journal covers a broad spectrum of topics within this domain.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            Our objective is to motivate students—from graduation onwards—to
            innovate in digital system design, inspire researchers to propose
            novel ideas, and provide a global platform for sharing research
            advancements.
          </p>
        </CardContent>
      </Card>
    </motion.div></div>
  );
}