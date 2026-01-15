import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Modal } from '../components/ui/modal';
import { apiPost } from '../lib/api';
import { queryClient } from '../lib/query-client';
import {
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  Users,
  RotateCcw,
} from 'lucide-react';

type ResetType = 'simple' | 'all' | 'personnes-without-table' | null;

export function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resetModal, setResetModal] = useState<ResetType>(null);
  const [resetting, setResetting] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await apiPost<{ success: boolean; message?: string; error?: string }>('/api/import', formData);

      if (data.success) {
        toast.success(data.message || 'Import réussi');
        queryClient.invalidateQueries({ queryKey: ['personnes'] });
      } else {
        toast.error(data.error || 'Erreur lors de l\'importation');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'importation');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const response = await fetch('/export');

      if (!response.ok) {
        throw new Error('Erreur lors de l\'exportation');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'exportation');
    } finally {
      setExporting(false);
    }
  };

  const handleReset = async () => {
    if (!resetModal) return;

    setResetting(true);

    try {
      const data = await apiPost<{ success: boolean; message?: string; error?: string }>(`/api/reset/${resetModal}`);

      if (data.success) {
        toast.success(data.message || 'Réinitialisation effectuée');
        queryClient.invalidateQueries({ queryKey: ['personnes'] });
        queryClient.invalidateQueries({ queryKey: ['tables'] });
      } else {
        toast.error(data.error || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la réinitialisation');
    } finally {
      setResetting(false);
      setResetModal(null);
    }
  };

  const getResetModalContent = () => {
    switch (resetModal) {
      case 'simple':
        return {
          title: 'Réinitialisation simple',
          description: 'Cette action va supprimer toutes les personnes et les tables, mais conserver le plan de salle et la configuration de l\'événement.',
          confirmText: 'Réinitialiser',
        };
      case 'all':
        return {
          title: 'Réinitialisation complète',
          description: 'Cette action va supprimer TOUTES les données : personnes, tables, plan de salle et configuration. Cette action est irréversible.',
          confirmText: 'Tout supprimer',
        };
      case 'personnes-without-table':
        return {
          title: 'Supprimer les personnes sans table',
          description: 'Cette action va supprimer uniquement les personnes qui ne sont pas assignées à une table.',
          confirmText: 'Supprimer',
        };
      default:
        return null;
    }
  };

  const modalContent = getResetModalContent();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Paramètres</h1>

      <div className="grid gap-6">
        {/* Import/Export section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import / Export
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Import */}
              <div className="flex-1 p-4 bg-muted rounded-lg border border-border">
                <h3 className="font-medium text-foreground mb-2">Importer des personnes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Importez un fichier Excel (.xlsx) contenant la liste des personnes.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importation...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Importer un fichier
                    </>
                  )}
                </Button>
              </div>

              {/* Export */}
              <div className="flex-1 p-4 bg-muted rounded-lg border border-border">
                <h3 className="font-medium text-foreground mb-2">Exporter les données</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Téléchargez toutes les données au format Excel.
                </p>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exportation...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Exporter en Excel
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Reset section */}
        <Card className="p-6 border-destructive/20">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Zone de danger
          </h2>

          <div className="space-y-4">
            {/* Delete persons without table */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Supprimer les personnes sans table
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supprime uniquement les personnes qui ne sont pas assignées à une table.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="flex-shrink-0 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 border-amber-300 dark:border-amber-700"
                  onClick={() => setResetModal('personnes-without-table')}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>

            {/* Simple reset */}
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Réinitialisation simple
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supprime toutes les personnes et tables, mais conserve le plan et la configuration.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => setResetModal('simple')}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>

            {/* Full reset */}
            <div className="p-4 bg-destructive/20 rounded-lg border border-destructive/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Réinitialisation complète
                  </h3>
                  <p className="text-sm text-destructive/80 mt-1">
                    Supprime TOUTES les données : personnes, tables, plan et configuration. Irréversible !
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="flex-shrink-0"
                  onClick={() => setResetModal('all')}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Tout supprimer
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirmation modal */}
      {modalContent && (
        <Modal
          open={resetModal !== null}
          onClose={() => setResetModal(null)}
          title={modalContent.title}
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">{modalContent.description}</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setResetModal(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReset} disabled={resetting}>
              {resetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  En cours...
                </>
              ) : (
                modalContent.confirmText
              )}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
