'use client'


import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function MissionVision() {
  return (
    <div className="w-full flex justify-center items-center bg-gray-200 min-h-screen h-fit">

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen  px-4  w-[99%] md:w-[80%] lg:pt-36 md:pt-40 pt-36"
    >
      <Card className="max-w-screen bg-white shadow-lg rounded-2xl shadow-neutral-950 py-4 w-full">
        <CardContent>
          <h2 className="text-3xl font-bold text-center text-gray-800 ">
            Our Mission and Vision
          </h2>
          
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">Vision Statement</h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            The vision of the <strong>Journal of Embedded and Digital System Design (JEDSD)</strong> is to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 text-lg mb-4">
            <li>Drive forward research in digital and embedded system design.</li>
            <li>Promote algorithm development and optimization for best design metrics.</li>
            <li>Be indexed by major citation databases like SCOPUS.</li>
            <li>Achieve Quartile 4 (Q4) ranking.</li>
            <li>Gain international recognition and become the preferred journal for researchers.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">Mission Statement</h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            To achieve our vision, we commit to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 text-lg">
            <li>Periodically publish quality original manuscripts in embedded and digital system design.</li>
            <li>Uphold author trust by maintaining confidentiality, ethics, and a focus on novelty.</li>
            <li>Reach global researchers through high standards and proper promotion.</li>
            <li>Obtain a Digital Object Identifier (DOI) and an International Standard Serial Number (ISSN).</li>
            <li>Prioritize quality over quantity to enhance citation impact and journal reputation.</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div></div>
  );
}