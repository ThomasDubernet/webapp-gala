import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Search, Pencil, Users, UserCheck } from 'lucide-react';
import { useSearchPersonnes, useGetMany } from '../hooks';
import { useDialogs } from '../contexts/DialogContext';
import { apiPut } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import type { Table } from '../types/api';

export function Personnes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [updatingPersonId, setUpdatingPersonId] = useState<number | null>(null);
  const { openPersonneDialog } = useDialogs();
  const { loading: loadingTables, load: loadTables, items: tables } = useGetMany<Table>('tables');

  const {
    results: personnes,
    loading,
    total,
    hasSearched,
    refresh: refreshPersonnes,
  } = useSearchPersonnes({
    searchQuery,
    minChars: 0,
    loadOnEmpty: true,
    limit: 500,
    unassignedOnly,
  });

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // Sort tables by numero for the dropdown
  const sortedTables = useMemo(() => {
    return [...tables].sort((a, b) => a.numero - b.numero);
  }, [tables]);

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

  const handleTableChange = async (personneId: number, tableId: string) => {
    setUpdatingPersonId(personneId);
    try {
      const tableIri = tableId ? `/api/tables/${tableId}` : null;
      await apiPut(`/api/personnes/${personneId}`, { table: tableIri });
      refreshPersonnes();
      await loadTables(); // Refresh table capacities
      toast.success('Table mise à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdatingPersonId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">Personnes</h1>
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
        <Button onClick={() => openPersonneDialog()}>
          <Plus className="h-4 w-4" />
          Nouvelle personne
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom, prénom, email..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={unassignedOnly}
            onChange={(e) => setUnassignedOnly(e.target.checked)}
          />
          <span
            className="text-sm text-muted-foreground cursor-pointer select-none"
            onClick={() => setUnassignedOnly(!unassignedOnly)}
          >
            Sans table uniquement
          </span>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : personnes.length > 0 ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Téléphone</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Table</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Paiement</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Présent</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {personnes.map((personne) => {
                  const paymentStatus = getPaymentStatus(personne);
                  return (
                    <tr key={personne.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {personne.civilite?.nom} {personne.prenom} {personne.nom?.toUpperCase()}
                        </div>
                        {personne.categorie && (
                          <div className="text-xs text-muted-foreground">{personne.categorie.nom}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {personne.email ? (
                          <a href={`mailto:${personne.email}`} className="hover:text-primary">
                            {personne.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {personne.telephone || <span className="text-muted-foreground/50">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={personne.table?.id?.toString() || ''}
                          onChange={(e) => handleTableChange(personne.id, e.target.value)}
                          disabled={updatingPersonId === personne.id || loadingTables}
                          className="h-8 w-36 text-xs"
                        >
                          <option value="">Sans table</option>
                          {sortedTables.map((table) => {
                            const occupancy = table.personnes?.length || 0;
                            const isFull = occupancy >= table.nombrePlacesMax;
                            const isCurrentTable = table.id === personne.table?.id;
                            return (
                              <option
                                key={table.id}
                                value={table.id}
                                disabled={isFull && !isCurrentTable}
                              >
                                Table {table.numero} ({occupancy}/{table.nombrePlacesMax})
                              </option>
                            );
                          })}
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        {paymentStatus === 'paid' && <Badge variant="success">Payé</Badge>}
                        {paymentStatus === 'partial' && <Badge variant="warning">Partiel</Badge>}
                        {paymentStatus === 'unpaid' && <Badge variant="destructive">Non payé</Badge>}
                        {paymentStatus === 'unknown' && <span className="text-muted-foreground/50">-</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {personne.present ? (
                          <Badge variant="success" className="w-6 h-6 p-0 justify-center">
                            ✓
                          </Badge>
                        ) : (
                          <Badge variant="default" className="w-6 h-6 p-0 justify-center">
                            -
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openPersonneDialog(personne.id)}>
                          <Pencil className="h-3 w-3" />
                          Modifier
                        </Button>
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
          <p className="text-muted-foreground">Aucune personne ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune personne enregistrée</p>
          <Button variant="link" className="mt-4" onClick={() => openPersonneDialog()}>
            <Plus className="h-4 w-4" />
            Ajouter une personne
          </Button>
        </div>
      )}
    </div>
  );
}
