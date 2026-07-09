import React from 'react';
import Link from 'next/link';

const topics = [
  'Embedded Systems',
  'VLSI Design',
  'IoT & Smart Systems',
  'FPGA & Reconfigurable Computing',
  'Digital Signal Processing',
  'Computer Architecture',
  'Machine Learning on Edge',
  'Cybersecurity in Embedded Systems',
  'Sensor Networks',
  'Real-Time Systems',
];

export default function CallForPapers() {
  return (
    <section className="bg-gradient-to-br from-[#0a0f1e] via-[#1e293b] to-[#0d3b66] py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="chicle-regular text-4xl text-white mb-4">
            Call for Papers
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            We are accepting submissions across the following research areas
          </p>
        </div>

        {/* Topic Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {topics.map((topic) => (
            <span
              key={topic}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 border border-white/20 text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-300 cursor-default"
            >
              {topic}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-300 text-lg mb-6">
            Ready to contribute to the field?
          </p>
          <Link
            href="/dashboard/paper/upload"
            className="inline-block bg-gradient-to-r from-blue-500 to-teal-400 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
          >
            Submit Your Research
          </Link>
        </div>
      </div>
    </section>
  );
}
