import React, { useEffect, useState } from 'react'
import { useGetMany } from '../hooks/useGetMany'
import { useTable } from '../hooks/useTables'
import { apiPost, apiPut } from '../lib/api'
import { queryClient } from '../lib/query-client'
import { useDialogs } from '../contexts/DialogContext'
import type { Table, CategorieTable, TablePayload, TableShape } from '../types/api'
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

  // Fetch existing table using TanStack Query
  const { data: existingTable, isLoading: loadingTable, error: fetchError } = useTable(id)

  // Shape options
  const shapeOptions: { value: TableShape; label: string; icon: string }[] = [
    { value: 'circle', label: 'Cercle', icon: '○' },
    { value: 'oval', label: 'Ovale', icon: '⬭' },
    { value: 'rectangle', label: 'Rectangle', icon: '▭' },
    { value: 'rounded-rectangle', label: 'Rectangle arrondi', icon: '▢' },
  ]

  // Form state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Table>>({
    nom: '',
    numero: undefined,
    nombrePlacesMax: 10,
    posX: '50',
    posY: '50',
    shape: 'circle',
    categorie: undefined,
  })

  // Load reference data when dialog opens
  useEffect(() => {
    if (open) {
      loadCategories()
      setError(null)
    }
  }, [open, loadCategories])

  // Populate form when existing table is loaded
  useEffect(() => {
    if (existingTable && open) {
      setFormData({
        nom: existingTable.nom || '',
        numero: existingTable.numero,
        nombrePlacesMax: existingTable.nombrePlacesMax,
        posX: existingTable.posX,
        posY: existingTable.posY,
        shape: existingTable.shape || 'circle',
        categorie: existingTable.categorie,
      })
    } else if (!id && open) {
      // New mode - reset form with center position
      setFormData({
        nom: '',
        numero: undefined,
        nombrePlacesMax: 10,
        posX: '50',
        posY: '50',
        shape: 'circle',
        categorie: undefined,
      })
    }
  }, [existingTable, id, open])

  // Handle fetch error
  useEffect(() => {
    if (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Table non trouvée')
    }
  }, [fetchError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Build API payload
      const payload: TablePayload = {
        nom: formData.nom || null,
        numero: formData.numero ?? 0,
        nombrePlacesMax: formData.nombrePlacesMax ?? 10,
        posX: formData.posX?.toString() || '0',
        posY: formData.posY?.toString() || '0',
        shape: formData.shape || 'circle',
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

        {loadingTable && id ? (
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

            {/* Shape */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Forme</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {shapeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('shape', option.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                      formData.shape === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl mb-1">{option.icon}</span>
                    <span className="text-xs text-muted-foreground">{option.label}</span>
                  </button>
                ))}
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
