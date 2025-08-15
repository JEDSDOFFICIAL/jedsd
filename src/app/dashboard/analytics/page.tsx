import React from 'react';

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics & Reports</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Analytics dashboard content will go here.</p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Features to implement:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Paper submission statistics</li>
            <li>Review completion rates</li>
            <li>User activity metrics</li>
            <li>Publication trends</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
