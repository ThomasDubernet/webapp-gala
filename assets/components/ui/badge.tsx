import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        secondary: 'bg-gray-200 text-gray-900',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        destructive: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        outline: 'border border-gray-300 text-gray-700 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
