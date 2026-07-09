import React from "react";
import { Shield, Unlock, Zap, Globe, Award, Users } from "lucide-react";

interface FeatureCard {
  icon: React.ElementType;
  colorClasses: string;
  title: string;
  description: string;
}

const features: FeatureCard[] = [
  {
    icon: Shield,
    colorClasses: "bg-blue-100 text-blue-600",
    title: "Rigorous Peer Review",
    description:
      "Every submission undergoes a thorough double-blind peer review by domain experts.",
  },
  {
    icon: Unlock,
    colorClasses: "bg-teal-100 text-teal-600",
    title: "Open Access",
    description:
      "All published papers are freely accessible to readers worldwide.",
  },
  {
    icon: Zap,
    colorClasses: "bg-amber-100 text-amber-600",
    title: "Fast Publication",
    description:
      "From submission to publication in under 30 days with our streamlined process.",
  },
  {
    icon: Globe,
    colorClasses: "bg-purple-100 text-purple-600",
    title: "Global Reach",
    description:
      "Your research reaches readers and institutions across 50+ countries.",
  },
  {
    icon: Award,
    colorClasses: "bg-rose-100 text-rose-600",
    title: "DOI Assignment",
    description:
      "Every published paper receives a unique DOI for permanent citability.",
  },
  {
    icon: Users,
    colorClasses: "bg-emerald-100 text-emerald-600",
    title: "Expert Editorial Board",
    description:
      "Guided by leading researchers and industry professionals in embedded systems.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="chicle-regular text-4xl text-gray-900 text-center mb-4">
          Why Publish with JEDSD?
        </h2>
        <p className="text-center text-gray-500 max-w-2xl mx-auto mb-14 text-lg">
          We provide a rigorous, transparent, and efficient publishing
          experience for researchers worldwide.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 ${feature.colorClasses}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
