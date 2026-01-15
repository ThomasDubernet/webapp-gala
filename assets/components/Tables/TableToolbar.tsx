import React from 'react'
import { Circle, Square, RectangleHorizontal, Trash2 } from 'lucide-react'
import type { TableShape } from '../../types/api'

interface TableToolbarProps {
  shape: TableShape
  onShapeChange: (shape: TableShape) => void
  onDelete: () => void
  style?: React.CSSProperties
}

const shapeOptions: { value: TableShape; icon: React.ReactNode; title: string }[] = [
  { value: 'circle', icon: <Circle className="h-4 w-4" />, title: 'Cercle' },
  { value: 'oval', icon: <Circle className="h-4 w-3" />, title: 'Ovale' },
  { value: 'rectangle', icon: <Square className="h-4 w-4" />, title: 'Rectangle' },
  { value: 'rounded-rectangle', icon: <RectangleHorizontal className="h-4 w-4" />, title: 'Arrondi' },
]

export function TableToolbar({ shape, onShapeChange, onDelete, style }: TableToolbarProps) {
  return (
    <div
      className="absolute z-50 flex items-center gap-1 p-1 bg-background border border-border rounded-lg shadow-lg"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Shape buttons */}
      {shapeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onShapeChange(option.value)}
          className={`p-1.5 rounded transition-colors ${
            shape === option.value
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
          }`}
          title={option.title}
        >
          {option.icon}
        </button>
      ))}

      {/* Separator */}
      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Delete button */}
      <button
        type="button"
        onClick={() => {
          if (window.confirm('Supprimer cette table ?')) {
            onDelete()
          }
        }}
        className="p-1.5 rounded text-destructive hover:bg-destructive/10 transition-colors"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
