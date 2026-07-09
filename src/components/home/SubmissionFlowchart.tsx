'use client';

import React from 'react';
import { UserPlus, Upload, Search, CheckCircle, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  step: number;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
}

const steps: Step[] = [
  {
    step: 1,
    title: 'Create Account',
    desc: 'Sign up for free and set up your researcher profile',
    icon: UserPlus,
    color: '#3b82f6',
  },
  {
    step: 2,
    title: 'Submit Paper',
    desc: 'Upload your manuscript following our formatting guidelines',
    icon: Upload,
    color: '#8b5cf6',
  },
  {
    step: 3,
    title: 'Peer Review',
    desc: 'Expert reviewers evaluate your research thoroughly',
    icon: Search,
    color: '#f59e0b',
  },
  {
    step: 4,
    title: 'Revise & Approve',
    desc: 'Address reviewer feedback and receive editorial approval',
    icon: CheckCircle,
    color: '#10b981',
  },
  {
    step: 5,
    title: 'Published!',
    desc: 'Your paper goes live with a DOI for global access',
    icon: BookOpen,
    color: '#ef4444',
  },
];

function HorizontalArrow() {
  return (
    <div className="hidden lg:flex items-center flex-shrink-0">
      <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
        <line
          x1="0"
          y1="12"
          x2="48"
          y2="12"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-dash-flow"
        />
        <polygon points="48,6 60,12 48,18" fill="#cbd5e1" />
      </svg>
    </div>
  );
}

function VerticalArrow() {
  return (
    <div className="flex lg:hidden justify-center flex-shrink-0">
      <svg width="24" height="40" viewBox="0 0 24 40" fill="none">
        <line
          x1="12"
          y1="0"
          x2="12"
          y2="28"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-dash-flow"
        />
        <polygon points="6,28 12,40 18,28" fill="#cbd5e1" />
      </svg>
    </div>
  );
}

export default function SubmissionFlowchart() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-4 md:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="chicle-regular text-4xl text-gray-900 mb-4">
            How to Get Published
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Follow our streamlined submission process from start to publication
          </p>
        </div>

        {/* Flowchart */}
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.step}>
                {/* Step Card */}
                <div
                  className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xs lg:w-48 relative z-10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
                  style={{
                    borderLeft: undefined,
                    borderTop: undefined,
                  }}
                >
                  {/* Mobile: left border; Desktop: top border */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl lg:hidden"
                    style={{ backgroundColor: step.color }}
                  />
                  <div
                    className="absolute left-0 right-0 top-0 h-1 rounded-t-2xl hidden lg:block"
                    style={{ backgroundColor: step.color }}
                  />

                  {/* Step Number Circle */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 flex-shrink-0"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.step}
                  </div>

                  {/* Icon */}
                  <Icon
                    className="size-6 mb-3 flex-shrink-0"
                    style={{ color: step.color }}
                  />

                  {/* Title */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 text-center">
                    {step.desc}
                  </p>
                </div>

                {/* Arrow Connector (not after last step) */}
                {i < steps.length - 1 && (
                  <>
                    <HorizontalArrow />
                    <VerticalArrow />
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
