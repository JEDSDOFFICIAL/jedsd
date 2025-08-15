import React from 'react';

export default function SearchPapersPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Search Papers</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Paper search functionality will go here.</p>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Search Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Search by title, author, keywords</li>
            <li>Filter by publication date</li>
            <li>Filter by status (published, under review, etc.)</li>
            <li>Advanced search options</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
