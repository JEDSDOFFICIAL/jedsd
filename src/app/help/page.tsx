import React from 'react';

export default function HelpCenterPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Help center content will go here.</p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Help Topics:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>How to submit a paper</li>
            <li>Review process guidelines</li>
            <li>Account management</li>
            <li>Publication guidelines</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
