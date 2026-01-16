import React, { useEffect, useState } from 'react'
import { Circle, Square, RectangleHorizontal, Trash2 } from 'lucide-react'
import type { TableShape } from '../../types/api'

interface TableToolbarProps {
  tableNumber: number
  tableName?: string | null
  shape: TableShape
  isOpen: boolean
  onShapeChange: (shape: TableShape) => void
  onDelete: () => void
}

const shapeOptions: { value: TableShape; icon: React.ReactNode; title: string }[] = [
  { value: 'circle', icon: <Circle className="h-5 w-5" />, title: 'Cercle' },
  { value: 'oval', icon: <Circle className="h-5 w-4" />, title: 'Ovale' },
  { value: 'rectangle', icon: <Square className="h-5 w-5" />, title: 'Rectangle' },
  { value: 'rounded-rectangle', icon: <RectangleHorizontal className="h-5 w-5" />, title: 'Arrondi' },
]

export function TableToolbar({ tableNumber, tableName, shape, isOpen, onShapeChange, onDelete }: TableToolbarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Handle open/close with animation
  useEffect(() => {
    if (isOpen) {
      // Show and animate in
      setShouldRender(true)
      // Small delay to ensure the initial state is rendered before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true)
        })
      })
    } else {
      // Animate out first
      setIsVisible(false)
      // Then hide after animation completes
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl shadow-xl transition-all duration-300 ease-out ${
        isVisible ? 'bottom-6 opacity-100' : '-bottom-16 opacity-0'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Table info */}
      <span className="text-sm font-medium text-foreground pr-2 border-r border-border">
        Table {tableNumber}{tableName ? ` - ${tableName}` : ''}
      </span>

      {/* Shape buttons */}
      {shapeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onShapeChange(option.value)}
          className={`p-2 rounded-lg transition-colors ${
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
      <div className="w-px h-6 bg-border mx-1" />

      {/* Delete button */}
      <button
        type="button"
        onClick={() => {
          if (window.confirm('Supprimer cette table ?')) {
            onDelete()
          }
        }}
        className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        title="Supprimer"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  )
}
