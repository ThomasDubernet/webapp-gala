import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetMany } from '../hooks/useGetMany';
import { apiPost, apiPut } from '../lib/api';
import type { Table, CategorieTable } from '../types/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export function TableEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  // Reference data
  const { items: categories, load: loadCategories } = useGetMany<CategorieTable>('categorie_tables');

  // Form state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Table>>({
    nom: '',
    numero: undefined,
    nombrePlacesMax: 10,
    posX: 0,
    posY: 0,
    categorie: undefined,
  });

  // Load reference data
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Load existing table for edit mode
  useEffect(() => {
    if (id && !isNew) {
      setLoading(true);
      fetch(`/api/tables/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Table non trouvée');
          return res.json();
        })
        .then((data: Table) => {
          setFormData({
            nom: data.nom || '',
            numero: data.numero,
            nombrePlacesMax: data.nombrePlacesMax,
            posX: data.posX,
            posY: data.posY,
            categorie: data.categorie,
          });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Build API payload
      const payload: Record<string, unknown> = {
        nom: formData.nom || null,
        numero: formData.numero,
        nombrePlacesMax: formData.nombrePlacesMax,
        posX: formData.posX?.toString() || '0',
        posY: formData.posY?.toString() || '0',
        categorie: formData.categorie ? `/api/categorie_tables/${formData.categorie.id}` : null,
      };

      const url = isNew ? '/api/tables' : `/api/tables/${id}`;
      const apiCall = isNew ? apiPost : apiPut;
      await apiCall(url, payload);

      navigate('/tables');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Table, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/tables')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Créer une table' : 'Modifier la table'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Basic info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Numéro *</Label>
                <Input
                  id="numero"
                  type="number"
                  min="1"
                  value={formData.numero ?? ''}
                  onChange={(e) => handleChange('numero', e.target.value ? parseInt(e.target.value) : undefined)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={formData.nom || ''}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  placeholder="ex: Table VIP"
                />
              </div>
            </div>
          </div>

          {/* Capacity & category */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Capacité et catégorie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombrePlacesMax">Nombre de places *</Label>
                <Input
                  id="nombrePlacesMax"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.nombrePlacesMax ?? ''}
                  onChange={(e) => handleChange('nombrePlacesMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="categorie">Catégorie</Label>
                <Select
                  id="categorie"
                  value={formData.categorie?.id?.toString() || ''}
                  onChange={(e) => {
                    const categorie = categories.find((c) => c.id === parseInt(e.target.value));
                    handleChange('categorie', categorie || undefined);
                  }}
                >
                  <option value="">Choisir une catégorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => navigate('/tables')}>
              Annuler
            </Button>
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
        </Card>
      </form>
    </div>
  );
}
