import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'tw:inline-flex tw:items-center tw:gap-1.5 tw:rounded-full tw:px-2.5 tw:py-0.5 tw:text-xs tw:font-medium tw:transition-colors',
  {
    variants: {
      variant: {
        default: 'tw:bg-gray-100 tw:text-gray-800',
        success: 'tw:bg-green-100 tw:text-green-800',
        warning: 'tw:bg-amber-100 tw:text-amber-800',
        destructive: 'tw:bg-red-100 tw:text-red-800',
        info: 'tw:bg-blue-100 tw:text-blue-800',
        outline: 'tw:border tw:border-gray-300 tw:text-gray-700 tw:bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
