import React from 'react';
import { useParams } from 'react-router-dom';

export function TableEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isNew ? 'Créer une table' : 'Modifier la table'}
      </h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">
          Le formulaire de création/édition de table sera affiché ici.
        </p>
      </div>
    </div>
  );
}
