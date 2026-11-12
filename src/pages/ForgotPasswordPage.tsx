import { AuthLayout } from '../components/auth/AuthLayout'
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function ForgotPasswordPage() {
  useDocumentTitle('Reset password')
  return <AuthLayout variant="forgot"><ForgotPasswordForm /></AuthLayout>
}
