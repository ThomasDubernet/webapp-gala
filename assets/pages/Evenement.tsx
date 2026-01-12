import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMany } from '../hooks/useGetMany';
import { apiPut, apiPost } from '../lib/api';
import type { Evenement as EvenementType } from '../types/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { ArrowLeft, Save, Upload, Loader2, Image, X } from 'lucide-react';

export function Evenement() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { items: events, load, loading: loadingEvents } = useGetMany<EvenementType>('evenements');
  const event = events[0];

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    billetwebId: '',
  });
  const [planUrl, setPlanUrl] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (event) {
      setFormData({
        nom: event.nom || '',
        billetwebId: event.billetwebId || '',
      });
      if (event.plan?.contentUrl) {
        setPlanUrl(event.plan.contentUrl);
      }
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiPut(`/api/evenements/${event.id}`, {
        nom: formData.nom,
        billetwebId: formData.billetwebId || null,
      });
      setSuccess('Événement mis à jour avec succès');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !event) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const data = await apiPost<{ plan: { contentUrl: string } }>(`/api/evenements/${event.id}/plan`, uploadData);
      setPlanUrl(data.plan.contentUrl);
      setSuccess('Plan mis à jour avec succès');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loadingEvents) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Aucun événement configuré.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/plan')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Configuration de l'événement</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Event name form */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom de l'événement</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="ex: Gala 2024"
                />
              </div>
              <div>
                <Label htmlFor="billetwebId">ID BilletWeb</Label>
                <Input
                  id="billetwebId"
                  value={formData.billetwebId}
                  onChange={(e) => setFormData({ ...formData, billetwebId: e.target.value })}
                  placeholder="ex: abc123"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'identifiant de l'événement sur BilletWeb pour la synchronisation des participants.
                </p>
              </div>
              {event.lastUpdateBilletWeb && (
                <div className="text-sm text-gray-500">
                  Dernière synchronisation : {new Date(event.lastUpdateBilletWeb).toLocaleString('fr-FR')}
                </div>
              )}
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Plan upload */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan de salle</h2>
          <p className="text-sm text-gray-500 mb-4">
            Téléchargez une image du plan de salle pour placer les tables.
            Formats acceptés : JPEG, PNG, GIF, WebP.
          </p>

          {planUrl && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Plan actuel :</p>
              <div className="relative inline-block">
                <img
                  src={planUrl}
                  alt="Plan de salle"
                  className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="plan-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {planUrl ? 'Changer le plan' : 'Télécharger un plan'}
                </>
              )}
            </Button>
            {!planUrl && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Image className="w-4 h-4" />
                Aucun plan téléchargé
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
