'use client'

import { useState, useMemo } from 'react'
import { Paintbrush } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const solids = [
  '#E2E2E2',
  '#ff75c3',
  '#ffa647',
  '#ffe83f',
  '#9fff5b',
  '#70e2ff',
  '#cd93ff',
  '#09203f',
  '#6366f1',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
]

const gradients = [
  'linear-gradient(to top left,#accbee,#e7f0fd)',
  'linear-gradient(to top left,#d5d4d0,#eeeeec)',
  'linear-gradient(to top left,#000000,#434343)',
  'linear-gradient(to top left,#09203f,#537895)',
  'linear-gradient(to top left,#AC32E4,#7918F2,#4801FF)',
  'linear-gradient(to top left,#f953c6,#b91d73)',
  'linear-gradient(to top left,#ee0979,#ff6a00)',
  'linear-gradient(to top left,#00c6ff,#0072ff)',
  'linear-gradient(to top left,#4facfe,#00f2fe)',
  'linear-gradient(to top left,#0ba360,#3cba92)',
  'linear-gradient(to top left,#40E0D0,#FF8C00,#FF0080)',
  'linear-gradient(to top left,#ff75c3,#ffa647,#ffe83f,#9fff5b,#70e2ff,#cd93ff)',
]

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  const defaultTab = useMemo(() => {
    if (value?.includes('gradient')) return 'gradient'
    return 'solid'
  }, [value])

  const handleSelect = (color: string) => {
    onChange(color)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex w-full items-center gap-2">
            {value ? (
              <div
                className="h-4 w-4 rounded !bg-cover !bg-center transition-all border border-border"
                style={{ background: value }}
              />
            ) : (
              <Paintbrush className="h-4 w-4" />
            )}
            <div className="flex-1 truncate">
              {value ? value : 'Choisir une couleur'}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger className="flex-1" value="solid">
              Solide
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="gradient">
              Dégradé
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solid" className="mt-0">
            <div className="flex flex-wrap gap-1 mb-3">
              {solids.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'h-6 w-6 rounded-md cursor-pointer transition-transform hover:scale-110 active:scale-105 border border-border',
                    value === color && 'ring-2 ring-primary ring-offset-2'
                  )}
                  style={{ background: color }}
                  onClick={() => handleSelect(color)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gradient" className="mt-0">
            <div className="flex flex-wrap gap-1 mb-3">
              {gradients.map((gradient) => (
                <button
                  key={gradient}
                  type="button"
                  className={cn(
                    'h-6 w-6 rounded-md cursor-pointer transition-transform hover:scale-110 active:scale-105 border border-border',
                    value === gradient && 'ring-2 ring-primary ring-offset-2'
                  )}
                  style={{ background: gradient }}
                  onClick={() => handleSelect(gradient)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Input
          id="custom-color"
          value={value || ''}
          placeholder="#000000"
          className="h-8 mt-2"
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      </PopoverContent>
    </Popover>
  )
}
