import Button from './Button'
import Modal from './Modal'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel: string
  /** "danger" makes the confirm button red. */
  tone?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel,
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <p className="modal__text">{description}</p>
      <div className="modal__footer">
        <Button variant="secondary" onClick={onCancel} data-autofocus>
          Cancel
        </Button>
        <Button variant={tone} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
