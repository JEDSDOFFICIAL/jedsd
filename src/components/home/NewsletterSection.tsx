import React from 'react';

export default function NewsletterSection() {
  return (
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Heading */}
        <h2 className="chicle-regular text-3xl text-gray-900 mb-4">
          Stay Updated
        </h2>
        <p className="text-gray-500 mb-8">
          Get notified about new publications, call for papers, and journal
          updates.
        </p>

        {/* Email Form */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex max-w-lg mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            aria-label="Email address"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-r-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
          >
            Subscribe
          </button>
        </form>

        {/* Privacy Note */}
        <p className="text-xs text-gray-400 mt-4">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
