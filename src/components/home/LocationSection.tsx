"use client";

import { JOURNAL, EDITOR_IN_CHIEF } from "@/lib/journal-info";
import { MapPin, Mail, Phone, User } from "lucide-react";

export default function LocationSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Location & Contact
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Visit us at our office or reach out for inquiries
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Address & Contact Details */}
            <div className="space-y-6">
              {/* Publisher Address */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {JOURNAL.publisher}
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {JOURNAL.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-600" />
                  Contact Information
                </h4>
                <div className="space-y-4">
                  {/* Editor-in-Chief */}
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {EDITOR_IN_CHIEF.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {EDITOR_IN_CHIEF.role}
                      </p>
                      <p className="text-xs text-gray-600">
                        {EDITOR_IN_CHIEF.institution}
                      </p>
                    </div>
                  </div>

                  {/* Email Addresses */}
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <a
                        href={`mailto:${EDITOR_IN_CHIEF.email}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline block"
                      >
                        {EDITOR_IN_CHIEF.email}
                      </a>
                      <a
                        href="mailto:editorial@jedsd.com"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline block"
                      >
                        editorial@jedsd.com
                      </a>
                      <a
                        href="mailto:jedsdofficial@gmail.com"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline block"
                      >
                        jedsdofficial@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <a
                        href="tel:+919330324297"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        +91 9330324297
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Journal Information */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Journal Information
                </h4>
                <dl className="space-y-2 text-sm">
                  
                  <div>
                    <dt className="inline font-medium text-gray-700">
                      Publication:{" "}
                    </dt>
                    <dd className="inline text-gray-600">
                      {JOURNAL.frequency}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-gray-700">
                      Model:{" "}
                    </dt>
                    <dd className="inline text-gray-600">
                      {JOURNAL.publicationModel}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="h-full min-h-[400px] rounded-lg overflow-hidden shadow-lg border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3562.5234567890123!2d88.7266!3d26.5269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDMxJzM2LjgiTiA4OMKwNDMnMzUuOCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Digital System Design Location - Jalpaiguri, West Bengal"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
