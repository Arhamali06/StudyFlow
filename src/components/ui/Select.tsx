import type { ComponentPropsWithRef } from 'react'
import { ChevronDown } from 'lucide-react'

/** A native <select> with our own chevron, so it matches the rest of the design. */
export default function Select({ className = '', children, ...rest }: ComponentPropsWithRef<'select'>) {
  return (
    <div className="select-wrap">
      <select className={`select ${className}`.trim()} {...rest}>
        {children}
      </select>
      <ChevronDown className="select-wrap__icon" size={18} aria-hidden="true" />
    </div>
  )
}
