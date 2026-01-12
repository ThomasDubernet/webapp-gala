import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onChange?: (event: { target: { checked: boolean } }) => void
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, onChange, ...props }, ref) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      ref={ref}
      onClick={() => onChange?.({ target: { checked: !checked } })}
      className={cn(
        'h-5 w-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-150',
        checked
          ? 'border-green-600 bg-green-600'
          : 'border-gray-300 bg-white hover:border-gray-400',
        className
      )}
      {...props}
    >
      {checked && (
        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
      )}
    </button>
  )
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
