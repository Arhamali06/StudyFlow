import { AuthLayout } from '../components/auth/AuthLayout'
import { SignupForm } from '../components/auth/SignupForm'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function SignupPage() {
  useDocumentTitle('Sign up')
  return <AuthLayout variant="signup"><SignupForm /></AuthLayout>
}
