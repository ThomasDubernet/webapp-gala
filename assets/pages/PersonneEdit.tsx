import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetMany } from '../hooks/useGetMany';
import { apiPost, apiPut } from '../lib/api';
import type { Personne, Civilite, CategoriePersonne, Table } from '../types/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Card } from '../components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface PersonneEditProps {
  isConjoint?: boolean;
}

const PAYMENT_METHODS = [
  { value: 'cheque', label: 'Chèque' },
  { value: 'virement', label: 'Virement' },
  { value: 'especes', label: 'Espèces' },
  { value: 'carte_bancaire', label: 'Carte Bancaire' },
  { value: 'paiement_en_ligne', label: 'Paiement en ligne' },
  { value: 'retenue_sur_salaire', label: 'Retenue sur salaire' },
];

export function PersonneEdit({ isConjoint = false }: PersonneEditProps) {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNew = !id;

  // Reference data
  const { items: civilites, load: loadCivilites } = useGetMany<Civilite>('civilites');
  const { items: categories, load: loadCategories } = useGetMany<CategoriePersonne>('categorie_personnes');
  const { items: tables, load: loadTables } = useGetMany<Table>('tables');

  // Form state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Personne>>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    montantBillet: undefined,
    montantPaye: undefined,
    dateReglement: undefined,
    moyenPaiement: '',
    commentaire: '',
    present: false,
    civilite: undefined,
    categorie: undefined,
    table: undefined,
  });

  // Load reference data
  useEffect(() => {
    loadCivilites();
    loadCategories();
    loadTables();
  }, [loadCivilites, loadCategories, loadTables]);

  // Load existing personne for edit mode
  useEffect(() => {
    if (id && !isNew) {
      setLoading(true);
      fetch(`/api/personnes/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Personne non trouvée');
          return res.json();
        })
        .then((data: Personne) => {
          setFormData({
            nom: data.nom || '',
            prenom: data.prenom || '',
            email: data.email || '',
            telephone: data.telephone || '',
            adresse: data.adresse || '',
            codePostal: data.codePostal || '',
            ville: data.ville || '',
            montantBillet: data.montantBillet,
            montantPaye: data.montantPaye,
            dateReglement: data.dateReglement?.split('T')[0],
            moyenPaiement: data.moyenPaiement || '',
            commentaire: data.commentaire || '',
            present: data.present || false,
            civilite: data.civilite,
            categorie: data.categorie,
            table: data.table,
          });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, isNew]);

  // Pre-fill table if specified in URL
  useEffect(() => {
    const tableId = searchParams.get('table');
    if (tableId && tables.length > 0) {
      const table = tables.find((t) => t.id === parseInt(tableId));
      if (table) {
        setFormData((prev) => ({ ...prev, table }));
      }
    }
  }, [searchParams, tables]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Build API payload
      const payload: Record<string, unknown> = {
        nom: formData.nom,
        prenom: formData.prenom || null,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse || null,
        codePostal: formData.codePostal || null,
        ville: formData.ville || null,
        montantBillet: formData.montantBillet?.toString() || null,
        montantPaye: formData.montantPaye?.toString() || null,
        dateReglement: formData.dateReglement || null,
        moyenPaiement: formData.moyenPaiement || null,
        commentaire: formData.commentaire || null,
        present: formData.present || false,
        civilite: formData.civilite ? `/api/civilites/${formData.civilite.id}` : null,
        categorie: formData.categorie ? `/api/categorie_personnes/${formData.categorie.id}` : null,
        table: formData.table ? `/api/tables/${formData.table.id}` : null,
      };

      const url = isNew ? '/api/personnes' : `/api/personnes/${id}`;
      const apiCall = isNew ? apiPost : apiPut;
      const savedPersonne = await apiCall<Personne>(url, payload);

      // Handle conjoint case - link this new person as conjoint to the original person
      if (isConjoint && id) {
        await apiPut(`/api/personnes/${id}`, {
          conjoint: `/api/personnes/${savedPersonne.id}`,
        });
      }

      navigate('/personnes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Personne, value: unknown) => {
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/personnes')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew
            ? 'Nouvelle personne'
            : isConjoint
              ? 'Ajouter un conjoint'
              : 'Modifier la personne'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Identity section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Identité</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="civilite">Civilité *</Label>
                <Select
                  id="civilite"
                  value={formData.civilite?.id?.toString() || ''}
                  onChange={(e) => {
                    const civilite = civilites.find((c) => c.id === parseInt(e.target.value));
                    handleChange('civilite', civilite);
                  }}
                  required
                >
                  <option value="">Choisir</option>
                  {civilites.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom || ''}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={formData.prenom || ''}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  id="telephone"
                  value={formData.telephone || ''}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Address section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="adresse">Adresse postale</Label>
                <Input
                  id="adresse"
                  value={formData.adresse || ''}
                  onChange={(e) => handleChange('adresse', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codePostal">Code postal</Label>
                  <Input
                    id="codePostal"
                    value={formData.codePostal || ''}
                    onChange={(e) => handleChange('codePostal', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ville">Ville</Label>
                  <Input
                    id="ville"
                    value={formData.ville || ''}
                    onChange={(e) => handleChange('ville', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paiement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="montantBillet">Montant du billet</Label>
                <Input
                  id="montantBillet"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.montantBillet ?? ''}
                  onChange={(e) => handleChange('montantBillet', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="montantPaye">Montant payé</Label>
                <Input
                  id="montantPaye"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.montantPaye ?? ''}
                  onChange={(e) => handleChange('montantPaye', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="dateReglement">Date de paiement</Label>
                <Input
                  id="dateReglement"
                  type="date"
                  value={formData.dateReglement || ''}
                  onChange={(e) => handleChange('dateReglement', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="moyenPaiement">Moyen de paiement</Label>
                <Select
                  id="moyenPaiement"
                  value={formData.moyenPaiement || ''}
                  onChange={(e) => handleChange('moyenPaiement', e.target.value)}
                >
                  <option value="">Choisir</option>
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.value} value={pm.value}>
                      {pm.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Assignment section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Affectation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="table">Table</Label>
                <Select
                  id="table"
                  value={formData.table?.id?.toString() || ''}
                  onChange={(e) => {
                    const table = tables.find((t) => t.id === parseInt(e.target.value));
                    handleChange('table', table || undefined);
                  }}
                >
                  <option value="">Choisir une table</option>
                  {tables.map((t) => {
                    const occupancy = t.personnes?.length || 0;
                    const isFull = occupancy >= t.nombrePlacesMax;
                    const isCurrentTable = formData.table?.id === t.id;
                    if (isFull && !isCurrentTable) return null;
                    return (
                      <option key={t.id} value={t.id}>
                        N°{t.numero} | {t.nom} ({occupancy}/{t.nombrePlacesMax})
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>
          </div>

          {/* Presence & comment section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Présence et commentaire</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="present"
                  checked={formData.present || false}
                  onChange={(e) => handleChange('present', e.target.checked)}
                />
                <Label htmlFor="present" className="cursor-pointer">
                  Présent
                </Label>
              </div>
              <div>
                <Label htmlFor="commentaire">Commentaire</Label>
                <Textarea
                  id="commentaire"
                  rows={4}
                  value={formData.commentaire || ''}
                  onChange={(e) => handleChange('commentaire', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => navigate('/personnes')}>
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
