import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search, Pencil, Users, UserCheck } from 'lucide-react';
import { useSearchPersonnes } from '../hooks';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';

export function Personnes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const {
    results: personnes,
    loading,
    total,
    hasSearched,
  } = useSearchPersonnes({
    searchQuery,
    minChars: 0,
    loadOnEmpty: true,
    limit: 500,
    unassignedOnly,
  });

  // Compute stats from results
  const stats = useMemo(() => {
    const assigned = personnes.filter((p) => p.table).length;
    const present = personnes.filter((p) => p.present).length;
    return { assigned, present };
  }, [personnes]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const getPaymentStatus = (p: typeof personnes[0]) => {
    if (p.montantBillet === null || p.montantBillet === undefined) return 'unknown';
    if (p.montantBillet === p.montantPaye) return 'paid';
    if (p.montantPaye && p.montantPaye > 0) return 'partial';
    return 'unpaid';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Personnes</h1>
          <Badge variant="secondary">
            {total} total
          </Badge>
          <Badge variant="info">
            <Users className="h-3 w-3 mr-1" />
            {stats.assigned} avec table
          </Badge>
          <Badge variant="success">
            <UserCheck className="h-3 w-3 mr-1" />
            {stats.present} présent{stats.present > 1 ? 's' : ''}
          </Badge>
        </div>
        <Link
          to="/personnes/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle personne
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher par nom, prénom, email..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={unassignedOnly}
            onChange={(e) => setUnassignedOnly(e.target.checked)}
          />
          <span
            className="text-sm text-gray-700 cursor-pointer select-none"
            onClick={() => setUnassignedOnly(!unassignedOnly)}
          >
            Sans table uniquement
          </span>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : personnes.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Téléphone</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Table</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Paiement</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Présent</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {personnes.map((personne) => {
                  const paymentStatus = getPaymentStatus(personne);
                  return (
                    <tr key={personne.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {personne.civilite?.nom} {personne.prenom} {personne.nom?.toUpperCase()}
                        </div>
                        {personne.categorie && (
                          <div className="text-xs text-gray-500">{personne.categorie.nom}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {personne.email ? (
                          <a href={`mailto:${personne.email}`} className="hover:text-blue-600">
                            {personne.email}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {personne.telephone || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        {personne.table ? (
                          <Badge variant="info">Table {personne.table.numero}</Badge>
                        ) : (
                          <Badge variant="warning">Sans table</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {paymentStatus === 'paid' && <Badge variant="success">Payé</Badge>}
                        {paymentStatus === 'partial' && <Badge variant="warning">Partiel</Badge>}
                        {paymentStatus === 'unpaid' && <Badge variant="destructive">Non payé</Badge>}
                        {paymentStatus === 'unknown' && <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {personne.present ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/personnes/${personne.id}/edit`}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                          Modifier
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
