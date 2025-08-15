import React from 'react';

export default function AdminSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">System settings interface will go here.</p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Settings Categories:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Application configuration</li>
            <li>Email templates management</li>
            <li>Workflow settings</li>
            <li>Security settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
