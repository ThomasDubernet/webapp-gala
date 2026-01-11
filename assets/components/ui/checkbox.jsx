import * as React from 'react'

const Checkbox = React.forwardRef(({ className, checked, onChange, ...props }, ref) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    ref={ref}
    onClick={() => onChange?.({ target: { checked: !checked } })}
    style={{
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      border: checked ? '2px solid #16a34a' : '2px solid #d1d5db',
      backgroundColor: checked ? '#16a34a' : '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      padding: 0,
    }}
    {...props}
  >
    {checked && (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )}
  </button>
))
Checkbox.displayName = 'Checkbox'

export { Checkbox }
