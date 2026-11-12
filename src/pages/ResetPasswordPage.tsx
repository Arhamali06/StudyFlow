import { AuthLayout } from '../components/auth/AuthLayout'
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function ResetPasswordPage() {
  useDocumentTitle('Choose a new password')
  return <AuthLayout variant="reset"><ResetPasswordForm /></AuthLayout>
}
