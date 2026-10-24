import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  /** Width of the dialog. */
  size?: 'sm' | 'md'
}

/**
 * Accessible modal built on the native <dialog> element, which gives us a
 * focus trap, an inert background and Escape-to-close for free.
 *
 * Mount it only while it should be visible: `{isOpen && <Modal ... />}`.
 * Put `data-autofocus` on the element that should receive focus first.
 */
export default function Modal({ title, onClose, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pressStartedOnBackdrop = useRef(false)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow

    if (!dialog.open) dialog.showModal()
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    document.body.style.overflow = 'hidden' // stop the page scrolling behind the dialog

    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.() // give focus back to the button that opened it
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${size}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault() // we close it ourselves so React stays in control
        onClose()
      }}
      onMouseDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        // Close only when the press AND release both happened on the backdrop,
        // so dragging a text selection out of an input doesn't close the dialog.
        if (event.target === event.currentTarget && pressStartedOnBackdrop.current) onClose()
      }}
    >
      <div className="modal__panel">
        <div className="modal__header">
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="icon-button icon-button--subtle"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </dialog>
  )
}
