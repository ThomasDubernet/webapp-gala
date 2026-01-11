import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'tw:inline-flex tw:items-center tw:justify-center tw:gap-2 tw:whitespace-nowrap tw:rounded-lg tw:text-sm tw:font-medium tw:transition-colors tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-offset-2 tw:disabled:pointer-events-none tw:disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'tw:bg-gray-900 tw:text-white tw:hover:bg-gray-800',
        destructive: 'tw:bg-red-600 tw:text-white tw:hover:bg-red-700',
        outline: 'tw:border tw:border-gray-300 tw:bg-transparent tw:hover:bg-gray-100',
        secondary: 'tw:bg-gray-100 tw:text-gray-900 tw:hover:bg-gray-200',
        ghost: 'tw:hover:bg-gray-100 tw:text-gray-700',
        link: 'tw:text-blue-600 tw:underline-offset-4 tw:hover:underline',
      },
      size: {
        default: 'tw:h-10 tw:px-4 tw:py-2',
        sm: 'tw:h-8 tw:px-3 tw:text-xs',
        lg: 'tw:h-12 tw:px-6',
        icon: 'tw:h-9 tw:w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
