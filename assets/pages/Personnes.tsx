import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search } from 'lucide-react';
import { useSearchPersonnes } from '../hooks';
import { PersonCard } from '../components/PersonCard';
import { Badge } from '../components/ui/badge';

export function Personnes() {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    results: personnes,
    loading,
    total,
    hasSearched,
    refresh,
  } = useSearchPersonnes({
    searchQuery,
    minChars: 0,
    loadOnEmpty: true,
    limit: 100,
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Personnes</h1>
          {total > 0 && (
            <Badge variant="secondary">
              {total} personne{total > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Link
          to="/personnes/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle personne
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher par nom, prénom, email..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : personnes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {personnes.map((personne) => (
            <PersonCard
              key={personne.id}
              personne={personne}
              onRefresh={refresh}
            />
          ))}
        </div>
      ) : hasSearched ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune personne ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune personne enregistrée</p>
          <Link
            to="/personnes/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Ajouter une personne
          </Link>
        </div>
      )}
    </div>
  );
}
