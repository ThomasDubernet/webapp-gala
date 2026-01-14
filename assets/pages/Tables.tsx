import React, { useEffect, useState } from 'react';
import { useGetMany } from '../hooks/useGetMany';
import { apiDelete } from '../lib/api';
import { useDialogs } from '../contexts/DialogContext';
import type { Table } from '../types/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/modal';
import { Plus, Edit2, Trash2, Users, Loader2 } from 'lucide-react';

export function Tables() {
  const { items: tables, load, loading } = useGetMany<Table>('tables');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { openTableDialog } = useDialogs();

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      await apiDelete(`/api/tables/${deleteId}`);
      load();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting table:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getOccupancyColor = (occupancy: number, max: number) => {
    const ratio = occupancy / max;
    if (ratio >= 1) return 'destructive';
    if (ratio >= 0.8) return 'warning';
    if (ratio >= 0.5) return 'default';
    return 'success';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Tables</h1>
        <Button onClick={() => openTableDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle table
        </Button>
      </div>

      {tables.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Aucune table pour le moment.</p>
          <Button onClick={() => openTableDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Créer une table
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables
            .sort((a, b) => a.numero - b.numero)
            .map((table) => {
              const occupancy = table.personnes?.length || 0;
              const categoryColor = table.categorie?.couleur || '#6B7280';

              return (
                <Card key={table.id} className="p-4 relative">
                  <div
                    className="absolute top-0 left-0 w-full h-1 rounded-t-lg"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <div className="flex items-start justify-between mb-3 pt-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">N°{table.numero}</span>
                        {table.categorie && (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: categoryColor,
                              color: categoryColor,
                            }}
                          >
                            {table.categorie.nom}
                          </Badge>
                        )}
                      </div>
                      {table.nom && (
                        <p className="text-sm text-muted-foreground">{table.nom}</p>
                      )}
                    </div>
                    <Badge variant={getOccupancyColor(occupancy, table.nombrePlacesMax)}>
                      <Users className="w-3 h-3 mr-1" />
                      {occupancy}/{table.nombrePlacesMax}
                    </Badge>
                  </div>

                  {table.personnes && table.personnes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Personnes assignées :</p>
                      <div className="flex flex-wrap gap-1">
                        {table.personnes.slice(0, 5).map((p) => (
                          <Badge key={p.id} variant="default" className="text-xs">
                            {p.prenom} {p.nom}
                          </Badge>
                        ))}
                        {table.personnes.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{table.personnes.length - 5} autres
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openTableDialog(table.id)}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(table.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
        </div>
      )}

      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Supprimer la table"
      >
        <p className="text-muted-foreground mb-4">
          Êtes-vous sûr de vouloir supprimer cette table ? Les personnes assignées seront désassignées.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              'Supprimer'
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
