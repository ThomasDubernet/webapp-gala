import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Modal } from '../components/ui/modal';
import { Input } from '../components/ui/input';
import { ColorPicker } from '../components/ui/color-picker';
import { apiPost, apiPatch, apiDelete } from '../lib/api';
import { useGetMany } from '../hooks/useGetMany';
import type { CategorieTable, CategorieTablePayload } from '../types/api';
import {
  Trash2,
  AlertTriangle,
  Loader2,
  Plus,
  Pencil,
  X,
  Check,
} from 'lucide-react';

const DEFAULT_CATEGORY_COLOR = '#6366f1';

interface CategoryFormState {
  nom: string;
  couleur: string;
}

interface CategoryFormProps {
  form: CategoryFormState;
  onChange: (form: CategoryFormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

function CategoryForm({ form, onChange, onSave, onCancel, saving }: CategoryFormProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Nom de la catégorie"
        value={form.nom}
        onChange={(e) => onChange({ ...form, nom: e.target.value })}
        className="flex-1"
      />
      <ColorPicker
        value={form.couleur}
        onChange={(couleur) => onChange({ ...form, couleur })}
        className="sm:w-64"
      />
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={onCancel} disabled={saving} aria-label="Annuler">
          <X className="w-4 h-4" />
        </Button>
        <Button size="icon" onClick={onSave} disabled={saving} aria-label="Enregistrer">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

export function Categories() {
  const { loading: loadingCategories, load: loadCategories, items: categories } = useGetMany<CategorieTable>('categorie_tables');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>({ nom: '', couleur: DEFAULT_CATEGORY_COLOR });
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<CategorieTable | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleStartCreateCategory = () => {
    setIsCreating(true);
    setEditingCategoryId(null);
    setCategoryForm({ nom: '', couleur: DEFAULT_CATEGORY_COLOR });
  };

  const handleStartEditCategory = (category: CategorieTable) => {
    setEditingCategoryId(category.id);
    setIsCreating(false);
    setCategoryForm({ nom: category.nom, couleur: category.couleur || DEFAULT_CATEGORY_COLOR });
  };

  const handleCancelCategoryEdit = () => {
    setIsCreating(false);
    setEditingCategoryId(null);
    setCategoryForm({ nom: '', couleur: DEFAULT_CATEGORY_COLOR });
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.nom.trim()) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    setSavingCategory(true);

    try {
      const payload: CategorieTablePayload = {
        nom: categoryForm.nom.trim(),
        couleur: categoryForm.couleur,
      };

      if (isCreating) {
        await apiPost('/api/categorie_tables', payload);
        toast.success('Catégorie créée avec succès');
      } else if (editingCategoryId) {
        await apiPatch(`/api/categorie_tables/${editingCategoryId}`, payload);
        toast.success('Catégorie modifiée avec succès');
      }

      await loadCategories();
      handleCancelCategoryEdit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryModal) return;

    setDeletingCategory(true);

    try {
      await apiDelete(`/api/categorie_tables/${deleteCategoryModal.id}`);
      toast.success('Catégorie supprimée avec succès');
      await loadCategories();
      setDeleteCategoryModal(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      toast.error(message);
    } finally {
      setDeletingCategory(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Catégories de table</h1>
        {!isCreating && editingCategoryId === null && (
          <Button onClick={handleStartCreateCategory}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle catégorie
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="space-y-3">
          {/* Creation form */}
          {isCreating && (
            <div className="p-4 bg-muted rounded-lg border border-border">
              <CategoryForm
                form={categoryForm}
                onChange={setCategoryForm}
                onSave={handleSaveCategory}
                onCancel={handleCancelCategoryEdit}
                saving={savingCategory}
              />
            </div>
          )}

          {/* Categories list */}
          {loadingCategories ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 && !isCreating ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune catégorie. Créez-en une pour commencer.
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="p-3 bg-muted rounded-lg border border-border">
                {editingCategoryId === category.id ? (
                  <CategoryForm
                    form={categoryForm}
                    onChange={setCategoryForm}
                    onSave={handleSaveCategory}
                    onCancel={handleCancelCategoryEdit}
                    saving={savingCategory}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-md border border-border flex-shrink-0"
                        style={{ background: category.couleur || DEFAULT_CATEGORY_COLOR }}
                      />
                      <span className="font-medium text-foreground">{category.nom}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEditCategory(category)}
                        aria-label={`Modifier ${category.nom}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteCategoryModal(category)}
                        aria-label={`Supprimer ${category.nom}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Delete category confirmation modal */}
      {deleteCategoryModal && (
        <Modal
          open={deleteCategoryModal !== null}
          onClose={() => setDeleteCategoryModal(null)}
          title="Supprimer la catégorie"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer la catégorie <strong>"{deleteCategoryModal.nom}"</strong> ?
              Cette action est irréversible.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteCategoryModal(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory} disabled={deletingCategory}>
              {deletingCategory ? (
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
      )}
    </div>
  );
}
