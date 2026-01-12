import React from 'react';
import { useParams } from 'react-router-dom';

interface PersonneEditProps {
  isConjoint?: boolean;
}

export function PersonneEdit({ isConjoint = false }: PersonneEditProps) {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isNew
          ? 'Nouvelle personne'
          : isConjoint
            ? 'Ajouter un conjoint'
            : 'Modifier la personne'}
      </h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">
          Le formulaire d'édition sera affiché ici.
        </p>
      </div>
    </div>
  );
}
