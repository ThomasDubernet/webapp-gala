import React, { useEffect, useState } from 'react'
import { useGetMany } from '../hooks/useGetMany'
import { usePersonne } from '../hooks/usePersonnes'
import { apiPost, apiPut } from '../lib/api'
import { queryClient } from '../lib/query-client'
import { useDialogs } from '../contexts/DialogContext'
import type { Personne, Civilite, CategoriePersonne, Table, PersonnePayload } from '../types/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'
import { DatePicker } from './ui/date-picker'
import { Save, Loader2, UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'

const PAYMENT_METHODS = [
  { value: 'cheque', label: 'Chèque' },
  { value: 'virement', label: 'Virement' },
  { value: 'especes', label: 'Espèces' },
  { value: 'carte_bancaire', label: 'Carte Bancaire' },
  { value: 'paiement_en_ligne', label: 'Paiement en ligne' },
  { value: 'retenue_sur_salaire', label: 'Retenue sur salaire' },
]

export function PersonneDialog() {
  const { personneDialogState, closePersonneDialog, openPersonneDialog } = useDialogs()
  const { open, id, tableId, conjointOf } = personneDialogState
  const isNew = !id
  const isConjoint = !!conjointOf

  // Reference data
  const { items: civilites, load: loadCivilites } = useGetMany<Civilite>('civilites')
  const { items: categories, load: loadCategories } = useGetMany<CategoriePersonne>('categorie_personnes')
  const { items: tables, load: loadTables } = useGetMany<Table>('tables')

  // Fetch existing personne using TanStack Query
  const { data: existingPersonne, isLoading: loadingPersonne, error: fetchError } = usePersonne(id)

  // Form state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
  })

  // Load reference data when dialog opens
  useEffect(() => {
    if (open) {
      loadCivilites()
      loadCategories()
      loadTables()
      setError(null)
    }
  }, [open, loadCivilites, loadCategories, loadTables])

  // Populate form when existing personne is loaded
  useEffect(() => {
    if (existingPersonne && open) {
      setFormData({
        nom: existingPersonne.nom || '',
        prenom: existingPersonne.prenom || '',
        email: existingPersonne.email || '',
        telephone: existingPersonne.telephone || '',
        adresse: existingPersonne.adresse || '',
        codePostal: existingPersonne.codePostal || '',
        ville: existingPersonne.ville || '',
        montantBillet: existingPersonne.montantBillet,
        montantPaye: existingPersonne.montantPaye,
        dateReglement: existingPersonne.dateReglement?.split('T')[0],
        moyenPaiement: existingPersonne.moyenPaiement || '',
        commentaire: existingPersonne.commentaire || '',
        present: existingPersonne.present || false,
        civilite: existingPersonne.civilite,
        categorie: existingPersonne.categorie,
        table: existingPersonne.table,
      })
    } else if (!id && open) {
      // New mode - reset form
      setFormData({
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
      })
    }
  }, [existingPersonne, id, open])

  // Handle fetch error
  useEffect(() => {
    if (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Personne non trouvée')
    }
  }, [fetchError])

  // Pre-fill table if specified
  useEffect(() => {
    if (tableId && tables.length > 0) {
      const table = tables.find((t) => t.id === tableId)
      if (table) {
        setFormData((prev) => ({ ...prev, table }))
      }
    }
  }, [tableId, tables])

  const buildPayload = (): PersonnePayload => ({
    nom: formData.nom || '',
    prenom: formData.prenom || null,
    email: formData.email || '',
    telephone: formData.telephone || null,
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
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = buildPayload()
      const url = isNew ? '/api/personnes' : `/api/personnes/${id}`
      const apiCall = isNew ? apiPost : apiPut
      const savedPersonne = await apiCall<Personne>(url, payload)

      // Handle conjoint case - link this new person as conjoint to the original person
      if (isConjoint && conjointOf) {
        await apiPut(`/api/personnes/${conjointOf}`, {
          conjoint: `/api/personnes/${savedPersonne.id}`,
        })
      }

      // Invalidate personnes cache to refresh lists
      queryClient.invalidateQueries({ queryKey: ['personnes'] })

      closePersonneDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitWithConjoint = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = buildPayload()
      const savedPersonne = await apiPost<Personne>('/api/personnes', payload)

      // Invalidate personnes cache
      queryClient.invalidateQueries({ queryKey: ['personnes'] })

      // Close current dialog and open for conjoint
      closePersonneDialog()
      // Small delay to ensure dialog is closed before reopening
      setTimeout(() => {
        openPersonneDialog(undefined, { conjointOf: savedPersonne.id })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Personne, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getTitle = () => {
    if (isNew) {
      return isConjoint ? 'Ajouter un conjoint' : 'Nouvelle personne'
    }
    return 'Modifier la personne'
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && closePersonneDialog()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {isNew ? 'Remplissez les informations pour créer une nouvelle personne.' : 'Modifiez les informations de la personne.'}
          </DialogDescription>
        </DialogHeader>

        {loadingPersonne && id ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {/* Identity section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Identité</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="civilite">Civilité *</Label>
                  <Select
                    id="civilite"
                    value={formData.civilite?.id?.toString() || ''}
                    onChange={(e) => {
                      const civilite = civilites.find((c) => c.id === parseInt(e.target.value))
                      handleChange('civilite', civilite)
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
              <h3 className="text-sm font-semibold text-foreground mb-3">Contact</h3>
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
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={formData.telephone || ''}
                    onChange={(e) => handleChange('telephone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Address section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Adresse</h3>
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
              <h3 className="text-sm font-semibold text-foreground mb-3">Paiement</h3>
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
                    onChange={(e) =>
                      handleChange('montantBillet', e.target.value ? parseFloat(e.target.value) : undefined)
                    }
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
                    onChange={(e) =>
                      handleChange('montantPaye', e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dateReglement">Date de paiement</Label>
                  <DatePicker
                    id="dateReglement"
                    value={formData.dateReglement}
                    onChange={(date) => {
                      if (date) {
                        const yyyy = date.getFullYear()
                        const mm = String(date.getMonth() + 1).padStart(2, '0')
                        const dd = String(date.getDate()).padStart(2, '0')
                        handleChange('dateReglement', `${yyyy}-${mm}-${dd}`)
                      } else {
                        handleChange('dateReglement', undefined)
                      }
                    }}
                    placeholder="Sélectionner une date"
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
              <h3 className="text-sm font-semibold text-foreground mb-3">Affectation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Select
                    id="categorie"
                    value={formData.categorie?.id?.toString() || ''}
                    onChange={(e) => {
                      const categorie = categories.find((c) => c.id === parseInt(e.target.value))
                      handleChange('categorie', categorie || undefined)
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
                      const table = tables.find((t) => t.id === parseInt(e.target.value))
                      handleChange('table', table || undefined)
                    }}
                  >
                    <option value="">Choisir une table</option>
                    {tables.map((t) => {
                      const occupancy = t.personnes?.length || 0
                      const isFull = occupancy >= t.nombrePlacesMax
                      const isCurrentTable = formData.table?.id === t.id
                      if (isFull && !isCurrentTable) return null
                      return (
                        <option key={t.id} value={t.id}>
                          N°{t.numero} | {t.nom} ({occupancy}/{t.nombrePlacesMax})
                        </option>
                      )
                    })}
                  </Select>
                </div>
              </div>
            </div>

            {/* Presence & comment section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Présence et commentaire</h3>
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
                    rows={3}
                    value={formData.commentaire || ''}
                    onChange={(e) => handleChange('commentaire', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={closePersonneDialog}>
                Annuler
              </Button>
              {isNew && !isConjoint && (
                <Button type="button" variant="secondary" disabled={saving} onClick={handleSubmitWithConjoint}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Enregistrer avec conjoint
                    </>
                  )}
                </Button>
              )}
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
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
