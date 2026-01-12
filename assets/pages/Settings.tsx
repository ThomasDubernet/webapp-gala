import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Modal } from '../components/ui/modal';
import {
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'importation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'importation' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);

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

      setMessage({ type: 'success', text: 'Export téléchargé avec succès' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'exportation' });
    } finally {
      setExporting(false);
    }
  };

  const handleReset = async () => {
    if (!resetModal) return;

    setResetting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/reset/${resetModal}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la réinitialisation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la réinitialisation' });
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid gap-6">
        {/* Import/Export section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import / Export
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Import */}
              <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Importer des personnes</h3>
                <p className="text-sm text-gray-500 mb-4">
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
              <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Exporter les données</h3>
                <p className="text-sm text-gray-500 mb-4">
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
        <Card className="p-6 border-red-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Zone de danger
          </h2>

          <div className="space-y-4">
            {/* Delete persons without table */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Supprimer les personnes sans table
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Supprime uniquement les personnes qui ne sont pas assignées à une table.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="flex-shrink-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100 border-orange-300"
                  onClick={() => setResetModal('personnes-without-table')}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>

            {/* Simple reset */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Réinitialisation simple
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Supprime toutes les personnes et tables, mais conserve le plan et la configuration.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-100 border-red-300"
                  onClick={() => setResetModal('simple')}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>

            {/* Full reset */}
            <div className="p-4 bg-red-100 rounded-lg border border-red-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-red-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Réinitialisation complète
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
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
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-gray-600">{modalContent.description}</p>
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
