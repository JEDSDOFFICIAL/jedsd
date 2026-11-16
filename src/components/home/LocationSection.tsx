'use client';

import { JOURNAL } from '@/lib/journal-info';
import { MapPin } from 'lucide-react';

export default function LocationSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Location
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Visit us at our office or reach out for inquiries
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Address Details */}
            <div className="space-y-6">
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

              {/* Additional Info */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Journal Information
                </h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="inline font-medium text-gray-700">ISSN: </dt>
                    <dd className="inline text-gray-600">{JOURNAL.issn}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-gray-700">Publication: </dt>
                    <dd className="inline text-gray-600">{JOURNAL.frequency}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-gray-700">Model: </dt>
                    <dd className="inline text-gray-600">{JOURNAL.publicationModel}</dd>
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
                style={{ border: 0, minHeight: '400px' }}
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
