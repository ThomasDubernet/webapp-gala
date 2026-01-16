import React, { useEffect, useRef, useState, RefObject, useReducer, useCallback } from 'react'
import Moveable from 'react-moveable'
import { MoreHorizontal, Loader2, Check, Users, UserPlus, Pencil, Trash2, Undo2, Redo2 } from 'lucide-react'
import { Personne as SearchPersonne } from '../Search'
import { useSearchPersonnes } from '../../hooks'
import { useDialogs } from '../../contexts/DialogContext'
import { Modal, ModalHeader, ModalBody } from '../ui/modal'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../ui/context-menu'
import { TableToolbar } from './TableToolbar'
import { apiPatch, apiDelete, apiPost } from '../../lib/api'
import { queryClient } from '../../lib/query-client'
import type { Table as TableType, Personne as PersonneType, TableShape } from '../../types/api'

interface PlanSize {
  width: number
  height: number
}

type SaveState = 'idle' | 'saving' | 'saved'

interface TableProps {
  table: TableType
  load: () => void
  planSize: PlanSize
  planRef: RefObject<HTMLDivElement | null>
  isSelected: boolean
  onSelect: (id: number) => void
  editable: boolean
}

// Undo/Redo state management
interface TableState {
  posX: number
  posY: number
  width: number
  height: number
  rotation: number
  shape: TableShape
}

interface UndoState {
  past: TableState[]
  present: TableState
  future: TableState[]
}

type UndoAction =
  | { type: 'SET'; state: TableState }
  | { type: 'PUSH'; state: TableState }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' }

/**
 * Maximum number of undo steps to keep in history.
 * Limited to 20 to balance memory usage with reasonable undo depth.
 * This allows users to undo multiple table manipulations without
 * consuming excessive memory for large table plans.
 */
const MAX_HISTORY = 20

/**
 * Reducer for managing undo/redo state history.
 * Implements a classic undo stack with limited history depth.
 *
 * Actions:
 * - SET: Initialize with a new state (clears history)
 * - PUSH: Add current state to history and set new state
 * - UNDO: Move back one step in history
 * - REDO: Move forward one step in history
 * - CLEAR: Reset to empty history with current state preserved
 */
function undoReducer(state: UndoState, action: UndoAction): UndoState {
  switch (action.type) {
    case 'SET':
      return { past: [], present: action.state, future: [] }
    case 'PUSH':
      return {
        past: [...state.past.slice(-MAX_HISTORY + 1), state.present],
        present: action.state,
        future: [],
      }
    case 'UNDO':
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      }
    case 'REDO':
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      }
    case 'CLEAR':
      return { past: [], present: state.present, future: [] }
    default:
      return state
  }
}

// Helper to get CSS classes for table shapes
function getShapeStyles(shape: TableShape): { borderRadius: string } {
  switch (shape) {
    case 'circle':
    case 'oval':
      return { borderRadius: '9999px' }
    case 'rectangle':
      return { borderRadius: '0' }
    case 'rounded-rectangle':
      return { borderRadius: '0.5rem' }
    default:
      return { borderRadius: '9999px' }
  }
}

function Table({ table, load, planSize: baseSize, planRef, isSelected, onSelect, editable }: TableProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const moveableRef = useRef<Moveable>(null)
  const { openPersonneDialog, openTableDialog } = useDialogs()
  const {
    id,
    nom,
    nombrePlacesMax: nbMax,
    numero,
    posX,
    posY,
    shape = 'circle',
    width: initialWidth = '7.76',
    height: initialHeight = '7.76',
    rotation: initialRotation = '0',
    personnes = [],
    categorie,
  } = table

  const couleur = categorie?.couleur || '#6366f1'

  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [planSize, setPlanSize] = useState<PlanSize>(baseSize)

  // Parse initial values
  const initialPosX = parseFloat(posX)
  const initialPosY = parseFloat(posY)
  const initialW = parseFloat(initialWidth)
  const initialH = parseFloat(initialHeight)
  const initialRot = parseFloat(initialRotation)

  // Undo/Redo
  const [undoState, dispatchUndo] = useReducer(undoReducer, {
    past: [],
    present: {
      posX: initialPosX,
      posY: initialPosY,
      width: initialW,
      height: initialH,
      rotation: initialRot,
      shape,
    },
    future: [],
  })

  // Interaction state
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  // Pixel state for rendering - initialized with calculated values
  const [pxState, setPxState] = useState(() => ({
    x: (initialPosX * baseSize.width) / 100,
    y: (initialPosY * baseSize.height) / 100,
    width: (initialW * baseSize.width) / 100,
    height: (initialH * baseSize.height) / 100,
  }))

  // Modal for adding people
  const [open, setOpen] = useState(false)
  const [stringToSearch, setStringToSearch] = useState('')
  const [addingPersonneId, setAddingPersonneId] = useState<number | null>(null)
  const [addedPersonneIds, setAddedPersonneIds] = useState<Set<number>>(new Set())
  const [lastAddedId, setLastAddedId] = useState<number | null>(null)

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    const hasAdded = addedPersonneIds.size > 0
    setOpen(false)
    setStringToSearch('')
    setAddedPersonneIds(new Set())
    setLastAddedId(null)
    if (hasAdded) {
      load()
    }
  }

  // Search for unassigned people
  const {
    results: filteredPersonnes,
    loading: searchLoading,
    total: searchTotal,
    hasSearched,
  } = useSearchPersonnes({
    searchQuery: stringToSearch,
    minChars: 2,
    unassignedOnly: true,
  })

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStringToSearch(event.target.value)
  }

  const handleAddPersonne = async (personneId: number) => {
    setAddingPersonneId(personneId)
    try {
      const data = await apiPost<{ success: boolean; error?: string }>(`/personne/${personneId}/add_table/${id}`)
      if (data.success) {
        // Track locally for immediate UI update (no cache timing issues)
        setAddedPersonneIds((prev) => new Set(prev).add(personneId))
        setLastAddedId(personneId)
        setTimeout(() => setLastAddedId(null), 1500)
        // Invalidate cache in background for other components
        queryClient.invalidateQueries({ queryKey: ['personnes'] })
      } else {
        alert(data.error || "Erreur lors de l'ajout")
      }
    } catch (error) {
      console.error('Erreur réseau:', error)
      alert(`Erreur: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setAddingPersonneId(null)
    }
  }

  /**
   * Converts pixel value to percentage relative to plan dimensions.
   * Used for saving table positions/sizes in a responsive format.
   * @param px - Pixel value to convert
   * @param dimension - 'width' or 'height' of the plan to use as reference
   * @returns Percentage value (0-100)
   */
  const pxToPercent = (px: number, dimension: 'width' | 'height') => {
    return (px / planSize[dimension]) * 100
  }

  /**
   * Converts percentage to pixel value relative to plan dimensions.
   * Used for rendering tables at their stored percentage positions.
   * @param percent - Percentage value (0-100)
   * @param dimension - 'width' or 'height' of the plan to use as reference
   * @param size - Optional plan size override (defaults to current planSize)
   * @returns Pixel value
   */
  const percentToPx = (percent: number, dimension: 'width' | 'height', size: PlanSize = planSize) => {
    return (percent * size[dimension]) / 100
  }

  // For circles/squares, use the smaller dimension to ensure true aspect ratio
  const minDimension = Math.min(planSize.width, planSize.height)

  /**
   * Converts percentage to pixels using the plan's smallest dimension.
   * Ensures circles remain circular regardless of plan aspect ratio.
   * @param percent - Percentage value (0-100)
   * @returns Pixel value based on plan's minimum dimension
   */
  const percentToPxSquare = (percent: number) => {
    return (percent * minDimension) / 100
  }

  /**
   * Minimum table size: 3% of plan's smallest dimension.
   * This prevents tables from being resized too small to be visible/usable,
   * while still allowing reasonably small tables for tight spaces.
   */
  const MIN_TABLE_SIZE_PERCENT = 0.03
  const minSizePx = minDimension * MIN_TABLE_SIZE_PERCENT

  // Get current shape from state
  const currentShape = undoState.present.shape

  // Update pixel state when percent state or plan size changes
  useEffect(() => {
    const isCircle = currentShape === 'circle'
    const w = isCircle
      ? percentToPxSquare(undoState.present.width)
      : percentToPx(undoState.present.width, 'width')
    const h = isCircle
      ? percentToPxSquare(undoState.present.width) // Use width for both to ensure square
      : percentToPx(undoState.present.height, 'height')

    setPxState({
      x: percentToPx(undoState.present.posX, 'width'),
      y: percentToPx(undoState.present.posY, 'height'),
      width: w,
      height: h,
    })
  }, [undoState.present, planSize, currentShape])

  // React to planSize prop changes
  useEffect(() => {
    if (baseSize.width !== planSize.width || baseSize.height !== planSize.height) {
      setPlanSize(baseSize)
    }
  }, [baseSize.width, baseSize.height])

  // Update Moveable when dimensions or shape change
  useEffect(() => {
    if (moveableRef.current) {
      // Small delay to ensure DOM has updated
      const timer = setTimeout(() => {
        moveableRef.current?.updateRect()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [pxState.width, pxState.height, currentShape])

  // Handle delete
  async function handleDelete() {
    await apiDelete(`/api/tables/${id}`)
    queryClient.invalidateQueries({ queryKey: ['tables'] })
    load()
  }

  // Save state to API with rollback on error
  const saveToApi = useCallback(async (state: TableState, previousState?: TableState) => {
    setSaveState('saving')
    try {
      await apiPatch<TableType>(`/api/tables/${id}`, {
        posX: String(state.posX.toFixed(2)),
        posY: String(state.posY.toFixed(2)),
        width: String(state.width.toFixed(2)),
        height: String(state.height.toFixed(2)),
        rotation: String(state.rotation.toFixed(2)),
        shape: state.shape,
      })
      setSaveState('saved')
      // Clear undo history after successful save (no unsaved changes)
      dispatchUndo({ type: 'CLEAR' })
      setTimeout(() => setSaveState('idle'), 1200)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      // Rollback to previous state on error
      if (previousState) {
        dispatchUndo({ type: 'SET', state: previousState })
      }
      setSaveState('idle')
    }
  }, [id])

  // Panel handlers
  const handlePositionChange = useCallback((x: number, y: number) => {
    const previousState = undoState.present
    const newState: TableState = { ...previousState, posX: x, posY: y }
    dispatchUndo({ type: 'PUSH', state: newState })
    saveToApi(newState, previousState)
  }, [undoState.present, saveToApi])

  const handleSizeChange = useCallback((width: number, height: number) => {
    const previousState = undoState.present
    const newState: TableState = { ...previousState, width, height }
    dispatchUndo({ type: 'PUSH', state: newState })
    saveToApi(newState, previousState)
  }, [undoState.present, saveToApi])

  const handleRotationChange = useCallback((rotation: number) => {
    const previousState = undoState.present
    const newState: TableState = { ...previousState, rotation }
    dispatchUndo({ type: 'PUSH', state: newState })
    saveToApi(newState, previousState)
  }, [undoState.present, saveToApi])

  const handleShapeChange = useCallback((newShape: TableShape) => {
    const previousState = undoState.present
    // When changing to circle, make height equal to width
    const newHeight = newShape === 'circle' ? previousState.width : previousState.height
    const newState: TableState = { ...previousState, shape: newShape, height: newHeight }
    dispatchUndo({ type: 'PUSH', state: newState })
    saveToApi(newState, previousState)
  }, [undoState.present, saveToApi])

  // Undo handler
  const handleUndo = useCallback(() => {
    if (undoState.past.length === 0) return
    dispatchUndo({ type: 'UNDO' })
    const prevState = undoState.past[undoState.past.length - 1]
    saveToApi(prevState)
  }, [undoState.past, saveToApi])

  // Redo handler
  const handleRedo = useCallback(() => {
    if (undoState.future.length === 0) return
    dispatchUndo({ type: 'REDO' })
    const nextState = undoState.future[0]
    saveToApi(nextState)
  }, [undoState.future, saveToApi])

  // Calculate occupation
  const occupationCount = personnes.length
  const shapeStyles = getShapeStyles(currentShape)

  // Cursor based on state (when not using Moveable handles)
  const getCursor = () => {
    if (!editable) return 'default'
    if (isDragging) return 'grabbing'
    if (isResizing) return 'nwse-resize'
    if (isRotating) return 'grab'
    if (isSelected) return 'move'
    if (isHovered) return 'pointer'
    return 'default'
  }

  // Beforeunload warning
  useEffect(() => {
    if (undoState.past.length > 0) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = ''
      }
      window.addEventListener('beforeunload', handler)
      return () => window.removeEventListener('beforeunload', handler)
    }
  }, [undoState.past.length])

  return (
    <>
        {/* Floating toolbar with dock-style animation */}
        {editable && (
          <TableToolbar
            tableNumber={numero}
            tableName={nom}
            shape={currentShape}
            isOpen={isSelected}
            onShapeChange={handleShapeChange}
            onDelete={handleDelete}
          />
        )}

        {/* Table element with context menu */}
        <ContextMenu>
          <ContextMenuTrigger asChild>
              <div
                ref={targetRef}
                onClick={(e) => {
                  e.stopPropagation()
                  if (editable && !isSelected) {
                    onSelect(id)
                  }
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`absolute z-10 transition-shadow duration-200 ${
                  saveState !== 'idle' ? 'opacity-70' : ''
                } ${isHovered && editable && !isSelected ? 'shadow-lg shadow-black/20' : ''}`}
                style={{
                  left: pxState.x,
                  top: pxState.y,
                  width: pxState.width,
                  height: pxState.height,
                  transform: `rotate(${undoState.present.rotation}deg)`,
                  background: couleur,
                  ...shapeStyles,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                  cursor: getCursor(),
                }}
              >
                {/* Table content - counter-rotated to stay upright */}
                <div
                  className="flex flex-col items-center justify-center"
                  style={{ transform: `rotate(-${undoState.present.rotation}deg)` }}
                >
                  {/* Table number centered */}
                  <span className="text-xs font-bold">T{numero}</span>

                  {/* Occupation badge */}
                  <span className="text-[10px] font-medium mt-0.5 bg-black/30 px-1 rounded">
                    {occupationCount}/{nbMax}
                  </span>
                </div>

                {/* Table name below */}
                {nom && (
                  <span
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap"
                    style={{ transform: `translateX(-50%) rotate(-${undoState.present.rotation}deg)` }}
                  >
                    {nom}
                  </span>
                )}

                {/* Save overlay */}
                {(saveState === 'saving' || saveState === 'saved') && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                    style={shapeStyles}
                  >
                    {saveState === 'saving' && (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    )}
                    {saveState === 'saved' && (
                      <div className="bg-green-500 rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ContextMenuTrigger>

          <ContextMenuContent className="w-56">
            {/* Undo/Redo only when selected and editable */}
            {isSelected && editable && (undoState.past.length > 0 || undoState.future.length > 0) && (
              <>
                <ContextMenuItem onClick={handleUndo} disabled={undoState.past.length === 0}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Annuler
                </ContextMenuItem>
                <ContextMenuItem onClick={handleRedo} disabled={undoState.future.length === 0}>
                  <Redo2 className="h-4 w-4 mr-2" />
                  Rétablir
                </ContextMenuItem>
                <ContextMenuSeparator />
              </>
            )}

            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Users className="h-4 w-4 mr-2" />
                Personnes
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-56">
                <ContextMenuItem onClick={handleOpen} disabled={personnes.length >= nbMax}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter une personne
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => openPersonneDialog(undefined, { tableId: id })}
                  disabled={personnes.length >= nbMax}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer une personne
                </ContextMenuItem>
                <ContextMenuSeparator />
                <div className="px-2 py-1 max-h-40 overflow-y-auto">
                  {personnes.length > 0 ? (
                    personnes.map((personne, index) => (
                      <PersonneItem key={index} personne={personne} onEdit={openPersonneDialog} />
                    ))
                  ) : (
                    <p className="px-2 py-1 text-sm text-muted-foreground">Aucune personne</p>
                  )}
                </div>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => openTableDialog(id)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editer la table
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() =>
                window.confirm('Êtes vous sûr de vouloir supprimer cette table ?') && handleDelete()
              }
              disabled={personnes.length > 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer la table
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {/* Moveable controls - drag, resize, rotate when selected and editable */}
        {isSelected && editable && (
          <Moveable
            ref={moveableRef}
            target={targetRef}
            container={planRef.current}
            draggable={true}
            resizable={true}
            rotatable={true}
            throttleResize={0}
            throttleRotate={0}
            keepRatio={currentShape === 'circle'}
            renderDirections={['nw', 'ne', 'sw', 'se']}
            rotationPosition="top"
            origin={false}
            padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
            // Drag handlers
            onDragStart={() => {
              setIsDragging(true)
            }}
            onDrag={({ target, left, top }) => {
              target.style.left = `${left}px`
              target.style.top = `${top}px`
            }}
            onDragEnd={({ target }) => {
              setIsDragging(false)
              const left = parseFloat(target.style.left)
              const top = parseFloat(target.style.top)
              const previousState = undoState.present
              const newState: TableState = {
                ...previousState,
                posX: pxToPercent(left, 'width'),
                posY: pxToPercent(top, 'height'),
              }
              dispatchUndo({ type: 'PUSH', state: newState })
              saveToApi(newState, previousState)
            }}
            // Resize handlers
            onResizeStart={() => {
              setIsResizing(true)
            }}
            onResize={({ target, width, height, drag }) => {
              target.style.width = `${width}px`
              target.style.height = `${height}px`
              target.style.left = `${drag.left}px`
              target.style.top = `${drag.top}px`
            }}
            onResizeEnd={({ target }) => {
              setIsResizing(false)
              const width = parseFloat(target.style.width)
              const height = parseFloat(target.style.height)
              const left = parseFloat(target.style.left)
              const top = parseFloat(target.style.top)
              const previousState = undoState.present

              // For circles, use the min dimension for both
              const isCircle = currentShape === 'circle'
              const newWidth = isCircle
                ? pxToPercent(Math.min(width, height), 'width') * (planSize.width / minDimension)
                : pxToPercent(width, 'width')
              const newHeight = isCircle
                ? newWidth
                : pxToPercent(height, 'height')

              const newState: TableState = {
                ...previousState,
                posX: pxToPercent(left, 'width'),
                posY: pxToPercent(top, 'height'),
                width: newWidth,
                height: newHeight,
              }
              dispatchUndo({ type: 'PUSH', state: newState })
              saveToApi(newState, previousState)
            }}
            // Rotate handlers
            onRotateStart={() => {
              setIsRotating(true)
            }}
            onRotate={({ target, rotate }) => {
              target.style.transform = `rotate(${rotate}deg)`
            }}
            onRotateEnd={({ target }) => {
              setIsRotating(false)
              const transform = target.style.transform
              const match = transform.match(/rotate\(([^)]+)deg\)/)
              const rotation = match ? parseFloat(match[1]) : 0
              const previousState = undoState.present
              const newState: TableState = {
                ...previousState,
                rotation: ((rotation % 360) + 360) % 360, // Normalize to 0-360
              }
              dispatchUndo({ type: 'PUSH', state: newState })
              saveToApi(newState, previousState)
            }}
          />
        )}

        {/* Modal Ajouter Personne */}
        <Modal open={open} onClose={handleClose} size="4xl">
          <ModalHeader onClose={handleClose}>
            <div className="flex items-center gap-3">
              <span>Personnes non affectées</span>
              {searchTotal > 0 && <Badge variant="secondary">{searchTotal}</Badge>}
            </div>
          </ModalHeader>
          <ModalBody className="h-[60vh] overflow-hidden flex flex-col">
            <div className="mb-4">
              <Input
                type="search"
                placeholder="Rechercher une personne"
                aria-label="Rechercher"
                value={stringToSearch}
                onChange={handleSearch}
                className="w-full md:w-1/2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start overflow-y-auto flex-1">
              {searchLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredPersonnes.filter((p) => !addedPersonneIds.has(p.id)).length > 0 ? (
                filteredPersonnes
                  .filter((p) => !addedPersonneIds.has(p.id))
                  .map((personne) => (
                    <SearchPersonne key={personne.id} personne={personne}>
                      <button
                        type="button"
                        className={`absolute bottom-3 right-3 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          lastAddedId === personne.id
                            ? 'bg-green-600 text-white'
                            : 'border border-primary text-primary hover:bg-primary/10'
                        } disabled:opacity-50`}
                        onClick={() => handleAddPersonne(personne.id)}
                        disabled={addingPersonneId === personne.id}
                      >
                        {addingPersonneId === personne.id
                          ? 'Ajout...'
                          : lastAddedId === personne.id
                            ? 'Ajouté'
                            : 'Ajouter'}
                      </button>
                    </SearchPersonne>
                  ))
              ) : hasSearched ? (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  Aucune personne ne correspond à votre recherche
                </div>
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  Tapez au moins 2 caractères pour rechercher
                </div>
              )}
            </div>
          </ModalBody>
        </Modal>
    </>
  )
}

interface PersonneItemProps {
  personne: PersonneType
  onEdit: (id: number) => void
}

function PersonneItem({ personne: { prenom, nom, id, present }, onEdit }: PersonneItemProps) {
  return (
    <div className="flex items-center justify-between w-full py-1">
      <p className={`text-sm ${present ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
        {prenom !== null ? prenom : null} {nom}
      </p>
      <button
        type="button"
        onClick={() => onEdit(id)}
        className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Table
