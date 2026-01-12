import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchPersonnes } from '../hooks/useSearchPersonnes';
import { PersonCard } from '../components/PersonCard';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

export function Hotesse() {
  const [stringToSearch, setStringToSearch] = useState('');

  const {
    results: filteredPersonnes,
    loading,
    total,
    hasSearched,
    refresh,
  } = useSearchPersonnes({
    searchQuery: stringToSearch,
    minChars: 2,
    loadOnEmpty: true,
    limit: 500,
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStringToSearch(event.target.value);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Interface Hôtesse</h1>
        <Badge variant="secondary">
          {total} personne{total > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3 max-w-md">
          <Input
            type="search"
            placeholder="Rechercher une personne..."
            aria-label="Rechercher"
            value={stringToSearch}
            onChange={handleSearch}
            className="flex-1"
          />
          {loading && (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          )}
        </div>
        {stringToSearch.length > 0 && stringToSearch.length < 2 && (
          <p className="mt-2 text-sm text-gray-500">
            Tapez au moins 2 caractères pour rechercher
          </p>
        )}
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
        {filteredPersonnes.length > 0
          ? filteredPersonnes.map((personne) => (
              <PersonCard
                key={personne.id}
                personne={personne}
                onRefresh={refresh}
                variant="fullpage"
              />
            ))
          : null}
      </div>

      {filteredPersonnes.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12 bg-white rounded-lg border border-gray-200">
          {hasSearched
            ? 'Aucune personne ne correspond à votre recherche'
            : 'Aucune personne enregistrée'}
        </div>
      )}
    </div>
  );
}
