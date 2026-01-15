import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Slider } from '../ui/slider'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Settings2, Trash2, Circle, Square, RectangleHorizontal } from 'lucide-react'
import type { TableShape } from '../../types/api'

interface TablePropertiesPanelProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  tableNumber: number
  tableName?: string | null
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  shape: TableShape
  onPositionChange: (x: number, y: number) => void
  onSizeChange: (width: number, height: number) => void
  onRotationChange: (rotation: number) => void
  onShapeChange: (shape: TableShape) => void
  onDelete: () => void
}

const shapeOptions: { value: TableShape; label: string; icon: React.ReactNode }[] = [
  { value: 'circle', label: 'Cercle', icon: <Circle className="h-4 w-4" /> },
  { value: 'oval', label: 'Ovale', icon: <Circle className="h-4 w-3" /> },
  { value: 'rectangle', label: 'Rectangle', icon: <Square className="h-4 w-4" /> },
  { value: 'rounded-rectangle', label: 'Arrondi', icon: <RectangleHorizontal className="h-4 w-4" /> },
]

export function TablePropertiesPanel({
  isOpen,
  onOpenChange,
  tableNumber,
  tableName,
  position,
  size,
  rotation,
  shape,
  onPositionChange,
  onSizeChange,
  onRotationChange,
  onShapeChange,
  onDelete,
}: TablePropertiesPanelProps) {
  const isCircleOrOval = shape === 'circle' || shape === 'oval'

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Table {tableNumber}{tableName ? ` - ${tableName}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Shape selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Forme</Label>
            <div className="grid grid-cols-4 gap-2">
              {shapeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onShapeChange(option.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 text-xs transition-colors ${
                    shape === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 text-muted-foreground'
                  }`}
                  title={option.label}
                >
                  {option.icon}
                  <span className="mt-1">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Position</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm w-8 text-muted-foreground">X</span>
                <Slider
                  value={[position.x]}
                  onValueChange={([x]) => onPositionChange(x, position.y)}
                  min={0}
                  max={100}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-sm w-14 text-right tabular-nums">{position.x.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm w-8 text-muted-foreground">Y</span>
                <Slider
                  value={[position.y]}
                  onValueChange={([y]) => onPositionChange(position.x, y)}
                  min={0}
                  max={100}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-sm w-14 text-right tabular-nums">{position.y.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Taille</Label>
            <div className="space-y-3">
              {isCircleOrOval ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm w-8 text-muted-foreground">Taille</span>
                  <Slider
                    value={[Math.max(size.width, size.height)]}
                    onValueChange={([s]) => onSizeChange(s, shape === 'circle' ? s : s * 0.7)}
                    min={3}
                    max={25}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-sm w-14 text-right tabular-nums">{Math.max(size.width, size.height).toFixed(1)}%</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-8 text-muted-foreground">L</span>
                    <Slider
                      value={[size.width]}
                      onValueChange={([w]) => onSizeChange(w, size.height)}
                      min={3}
                      max={30}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-sm w-14 text-right tabular-nums">{size.width.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-8 text-muted-foreground">H</span>
                    <Slider
                      value={[size.height]}
                      onValueChange={([h]) => onSizeChange(size.width, h)}
                      min={3}
                      max={30}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-sm w-14 text-right tabular-nums">{size.height.toFixed(1)}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Rotation */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rotation</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[rotation]}
                onValueChange={([r]) => onRotationChange(r)}
                min={0}
                max={360}
                step={5}
                className="flex-1"
              />
              <span className="text-sm w-14 text-right tabular-nums">{rotation.toFixed(0)}°</span>
            </div>
          </div>

          {/* Delete button */}
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) {
                  onDelete()
                  onOpenChange(false)
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer la table
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
