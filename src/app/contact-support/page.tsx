import React from 'react';

export default function ContactSupportPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Contact Support</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Contact support form will go here.</p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Support Options:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Submit a support ticket</li>
            <li>Live chat support</li>
            <li>Email support</li>
            <li>FAQ section</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
