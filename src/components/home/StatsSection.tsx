"use client";

import React, { useRef, useState, useEffect } from "react";
import { FileText, Users, Globe, Clock } from "lucide-react";

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
  borderColor: string;
}

const stats: StatItem[] = [
  {
    icon: FileText,
    value: 500,
    suffix: "+",
    label: "Papers Published",
    borderColor: "border-blue-500",
  },
  {
    icon: Users,
    value: 200,
    suffix: "+",
    label: "Expert Reviewers",
    borderColor: "border-teal-400",
  },
  {
    icon: Globe,
    value: 50,
    suffix: "+",
    label: "Countries Reached",
    borderColor: "border-purple-500",
  },
  {
    icon: Clock,
    value: 30,
    suffix: " Days",
    label: "Avg. Review Time",
    prefix: "<",
    borderColor: "border-amber-400",
  },
];

function AnimatedCounter({
  target,
  prefix,
  suffix,
  shouldAnimate,
}: {
  target: number;
  prefix?: string;
  suffix: string;
  shouldAnimate: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return;

    let startTime: number | null = null;
    const duration = 2000;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [shouldAnimate, target]);

  return (
    <span className="text-3xl md:text-4xl font-bold text-white">
      {prefix ?? ""}
      {count}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#0a0f1e] via-[#111827] to-[#0a0f1e]"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="chicle-regular text-4xl text-white text-center mb-14">
          JEDSD by the Numbers
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`glass rounded-2xl p-6 text-center border-t-4 ${stat.borderColor} transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="flex justify-center mb-4">
                  <Icon className="w-8 h-8 text-gray-300" />
                </div>
                <AnimatedCounter
                  target={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  shouldAnimate={isVisible}
                />
                <p className="text-sm text-gray-400 mt-2">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
