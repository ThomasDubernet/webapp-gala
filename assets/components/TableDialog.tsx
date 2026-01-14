import React, { useEffect, useState } from 'react'
import { useGetMany } from '../hooks/useGetMany'
import { apiPost, apiPut } from '../lib/api'
import { queryClient } from '../lib/query-client'
import { useDialogs } from '../contexts/DialogContext'
import type { Table, CategorieTable } from '../types/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Save, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'

export function TableDialog() {
  const { tableDialogState, closeTableDialog } = useDialogs()
  const { open, id } = tableDialogState
  const isNew = !id

  // Reference data
  const { items: categories, load: loadCategories } = useGetMany<CategorieTable>('categorie_tables')

  // Form state
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Table>>({
    nom: '',
    numero: undefined,
    nombrePlacesMax: 10,
    posX: '50',
    posY: '50',
    categorie: undefined,
  })

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      loadCategories()

      if (id) {
        // Edit mode - load existing table
        setLoading(true)
        fetch(`/api/tables/${id}`)
          .then((res) => {
            if (!res.ok) throw new Error('Table non trouvée')
            return res.json()
          })
          .then((data: Table) => {
            setFormData({
              nom: data.nom || '',
              numero: data.numero,
              nombrePlacesMax: data.nombrePlacesMax,
              posX: data.posX,
              posY: data.posY,
              categorie: data.categorie,
            })
            setLoading(false)
          })
          .catch((err) => {
            setError(err.message)
            setLoading(false)
          })
      } else {
        // New mode - reset form with center position
        setFormData({
          nom: '',
          numero: undefined,
          nombrePlacesMax: 10,
          posX: '50',
          posY: '50',
          categorie: undefined,
        })
        setLoading(false)
      }
      setError(null)
    }
  }, [open, id, loadCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Build API payload
      const payload: Record<string, unknown> = {
        nom: formData.nom || null,
        numero: formData.numero,
        nombrePlacesMax: formData.nombrePlacesMax,
        posX: formData.posX?.toString() || '0',
        posY: formData.posY?.toString() || '0',
        categorie: formData.categorie ? `/api/categorie_tables/${formData.categorie.id}` : null,
      }

      const url = isNew ? '/api/tables' : `/api/tables/${id}`
      const apiCall = isNew ? apiPost : apiPut
      await apiCall(url, payload)

      // Invalidate tables cache to refresh lists
      queryClient.invalidateQueries({ queryKey: ['tables'] })

      closeTableDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Table, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && closeTableDialog()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Créer une table' : 'Modifier la table'}</DialogTitle>
          <DialogDescription>
            {isNew ? 'Remplissez les informations pour créer une nouvelle table.' : 'Modifiez les informations de la table.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
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

            {/* Basic info */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Informations</h3>
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
              <h3 className="text-sm font-semibold text-foreground mb-3">Capacité et catégorie</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombrePlacesMax">Nombre de places *</Label>
                  <Input
                    id="nombrePlacesMax"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.nombrePlacesMax ?? ''}
                    onChange={(e) =>
                      handleChange('nombrePlacesMax', e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    required
                  />
                </div>
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
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={closeTableDialog}>
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
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
