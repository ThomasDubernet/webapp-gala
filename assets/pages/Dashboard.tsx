import React from 'react';

export function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Plan de salle</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">
          Le plan de salle sera affiché ici avec les tables positionnées.
        </p>
      </div>
    </div>
  );
}
