import { zodResolver } from '@hookform/resolvers/zod'
import { Download, Info, KeyRound, LockKeyhole, Mail, Monitor, Settings as SettingsIcon, Trash2, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Avatar from '../components/ui/Avatar'
import { PasswordInput } from '../components/auth/PasswordInput'
import { PasswordStrength } from '../components/auth/PasswordStrength'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../context/authContext'
import { useAppData } from '../hooks/useAppData'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { ThemePreference } from '../types'
import { supabase } from '../utils/supabase'

// oxlint-disable react/incompatible-library
const tabs = [
  { value: 'profile', label: 'Profile' },
  { value: 'security', label: 'Security' },
  { value: 'preferences', label: 'Preferences' },
  { value: 'data', label: 'Data' },
] as const
type SettingsTab = typeof tabs[number]['value']
const profileSchema = z.object({ fullName: z.string().trim().min(1, 'Enter a display name.').max(40, 'Display name must be 40 characters or fewer.') })
type ProfileForm = z.infer<typeof profileSchema>

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' },
]

function getTab(value: string | null): SettingsTab {
  return tabs.some((tab) => tab.value === value) ? value as SettingsTab : 'profile'
}

function memberSince(value: string | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(value))
}

function DeleteAccountDialog({ onCancel, onDelete }: { onCancel: () => void; onDelete: (password: string) => Promise<string | null> }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!password || confirmation !== 'DELETE' || loading) return
    setLoading(true)
    try {
      const result = await onDelete(password)
      setPassword('')
      setConfirmation('')
      if (result) setError(result)
    } catch {
      setError('Unable to delete your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Delete your account?" onClose={onCancel} size="sm" role="alertdialog">
      <form className="settings-form" onSubmit={submit} aria-describedby="delete-account-description">
        <p id="delete-account-description" className="modal__text">This permanently deletes your account, profile, subjects and tasks. This cannot be undone.</p>
        <p className="settings-help">Download your data first from the <Link to="/settings?tab=data" onClick={onCancel}>Data</Link> tab.</p>
        <PasswordInput id="delete-account-password" label="Password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} />
        <FormField id="delete-account-confirmation" label="Type DELETE to confirm" error={error}><input id="delete-account-confirmation" className="input" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError('') }} autoComplete="off" aria-describedby={error ? 'delete-account-confirmation-error' : undefined} /></FormField>
        <div className="modal__footer"><Button type="button" variant="secondary" onClick={onCancel} data-autofocus>Cancel</Button><Button type="submit" variant="danger" disabled={!password || confirmation !== 'DELETE' || loading}>{loading ? 'Deleting…' : 'Delete account'}</Button></div>
      </form>
    </Modal>
  )
}

export default function SettingsPage() {
  useDocumentTitle('Settings')
  const [searchParams] = useSearchParams()
  const activeTab = getTab(searchParams.get('tab'))
  const navigate = useNavigate()
  const { user, updateEmail, updatePassword, reauthenticate, signOutEverywhere } = useAuth()
  const hasPasswordIdentity = user?.identities?.some((identity) => identity.provider === 'email') ?? Boolean(user?.email)
  const { profile, updateFullName } = useProfile()
  const { subjects, tasks, clearAllData } = useAppData()
  const { theme, setTheme } = useTheme()
  const { showToast } = useToast()
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailMessage, setEmailMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; error?: boolean } | null>(null)
  const [currentPasswordError, setCurrentPasswordError] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const activeTabRef = useRef<HTMLAnchorElement | null>(null)
  // oxlint-disable-next-line react/incompatible-library
  const { register, handleSubmit, reset, watch, formState: { errors, isDirty, isValid, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: { fullName: profile?.full_name ?? '' },
  })
  const fullName = watch('fullName', '')

  useEffect(() => { reset({ fullName: profile?.full_name ?? '' }) }, [profile?.full_name, reset])
  useEffect(() => { activeTabRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' }) }, [activeTab])

  async function saveProfile(values: ProfileForm) {
    const result = await updateFullName(values.fullName)
    if (result.ok) showToast('Display name saved.')
    else showToast(result.error, 'error')
  }

  async function handleClearData() {
    const result = await clearAllData()
    setIsResetOpen(false)
    showToast(result.ok ? 'All data cleared.' : result.error, result.ok ? 'success' : 'error')
  }

  async function changeEmail(event: FormEvent) {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(newEmail.trim())) { setEmailMessage({ text: 'Enter a valid email address.', error: true }); return }
    setEmailLoading(true)
    const result = await updateEmail(newEmail.trim())
    setEmailLoading(false)
    setEmailMessage(result.error
      ? { text: result.error, error: true }
      : result.status === 'pending'
        ? { text: 'Email change is pending. Check your new email address to confirm it.' }
        : { text: 'Email updated successfully.' })
    if (!result.error) setNewEmail('')
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault()
    if (newPassword.length < 8 || !/\d/.test(newPassword)) { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordMessage({ text: 'Use at least 8 characters and one number.', error: true }); return }
    if (newPassword !== confirmPassword) { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordMessage({ text: 'New passwords do not match.', error: true }); return }
    if (!user?.email) return
    setPasswordLoading(true)
    const reauthResult = await reauthenticate(currentPassword)
    if (reauthResult.error) {
      setPasswordLoading(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setCurrentPasswordError(reauthResult.error)
      setPasswordMessage({ text: reauthResult.error, error: true })
      return
    }
    setCurrentPasswordError('')
    const result = await updatePassword(newPassword)
    setPasswordLoading(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordMessage(result.error ? { text: result.error, error: true } : { text: 'Password changed successfully.' })
  }

  async function signOutAll() {
    const result = await signOutEverywhere()
    if (result.error) showToast(result.error, 'error')
    else {
      showToast('Signed out of all devices.')
      navigate('/login', { replace: true })
    }
  }

  function downloadExport() {
    const date = new Date()
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const payload = JSON.stringify({ app: 'StudyFlow', exportedAt: date.toISOString(), subjects, tasks }, null, 2)
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `studyflow-export-${dateString}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function deleteAccount(password: string) {
    const reauthResult = await reauthenticate(password)
    if (reauthResult.error) return reauthResult.error
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.access_token) return 'Your session has expired. Please sign in again.'
    const { error } = await supabase.functions.invoke('delete-account', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (error) return 'Unable to delete your account. Please try again.'
    await supabase.auth.signOut({ scope: 'local' })
    showToast('Your account was deleted.')
    navigate('/login', { replace: true })
    return null
  }

  return (
    <>
      <header className="page-header">
        <div><h1 className="page-header__title">Settings</h1><p className="page-header__subtitle">Manage your profile, security and data.</p></div>
      </header>
      <nav className="tabs settings-tabs" aria-label="Settings sections">
        {tabs.map((tab) => <NavLink ref={activeTab === tab.value ? activeTabRef : undefined} key={tab.value} to={`/settings?tab=${tab.value}`} className={`tab${activeTab === tab.value ? ' is-active' : ''}`} aria-current={activeTab === tab.value ? 'page' : undefined}>{tab.label}</NavLink>)}
      </nav>

      {activeTab === 'profile' && (
        <div className="settings-profile-stack">
          <section className="card settings-card" aria-labelledby="profile-heading">
            <div className="profile-summary">
              <Avatar name={profile?.full_name} email={user?.email} userId={user?.id} size="profile" />
              <div className="profile-summary__copy"><h2 id="profile-heading">{profile?.full_name || 'Your profile'}</h2><p>{user?.email}</p><span className="badge badge--neutral">Member since {memberSince(profile?.created_at)}</span></div>
            </div>
            <form className="settings-form profile-form" onSubmit={handleSubmit(saveProfile)}>
              <div className="profile-form__grid">
                <FormField id="display-name" label="Display name" error={errors.fullName?.message}>
                  <input id="display-name" className="input" type="text" autoComplete="name" maxLength={40} {...register('fullName')} aria-invalid={errors.fullName ? 'true' : 'false'} aria-describedby={errors.fullName ? 'display-name-error' : 'display-name-help'} />
                  <p id="display-name-help" className="settings-help">Shown in your dashboard greeting. {fullName.trim().length} / 40</p>
                </FormField>
                <FormField id="account-email" label="Email">
                  <div className="input-with-icon"><input id="account-email" className="input input--readonly" value={user?.email ?? ''} readOnly aria-describedby="account-email-help" /><LockKeyhole size={16} aria-hidden="true" /></div>
                  <p id="account-email-help" className="settings-help">To change your email, go to <Link to="/settings?tab=security">Security</Link>.</p>
                </FormField>
              </div>
              <div className="settings-actions"><Button type="submit" variant="primary" disabled={!isDirty || !isValid || isSubmitting}>{isSubmitting ? 'Saving…' : 'Save changes'}</Button></div>
            </form>
          </section>
          <section className="card settings-card" aria-labelledby="workspace-heading">
            <h2 id="workspace-heading">Your workspace</h2>
            <div className="workspace-stats"><strong>{subjects.length}<span>Subjects</span></strong><strong>{tasks.length}<span>Tasks</span></strong><strong>{tasks.filter((task) => task.status === 'completed').length}<span>Completed</span></strong></div>
          </section>
        </div>
      )}

      {activeTab === 'preferences' && <div className="settings-grid">
        <section className="card settings-card" aria-labelledby="appearance-heading"><div className="settings-card__heading"><SettingsIcon size={20} aria-hidden="true" /><h2 id="appearance-heading">Appearance</h2></div><fieldset className="field field--group"><legend className="field__label">Theme</legend><div className="segmented">{THEME_OPTIONS.map((option) => <label className="segmented__option" key={option.value}><input type="radio" name="theme" value={option.value} checked={theme === option.value} onChange={() => setTheme(option.value)} /><span>{option.label}</span></label>)}</div><p className="settings-help">System follows your device setting.</p></fieldset></section>
        <section className="card settings-card" aria-labelledby="about-heading"><div className="settings-card__heading"><Info size={20} aria-hidden="true" /><h2 id="about-heading">About</h2></div><p className="settings-about__name">StudyFlow</p><p className="settings-help">A personal study planner for organizing tasks, subjects, deadlines and progress.</p><p className="settings-help">Your subjects and tasks are stored securely in your StudyFlow account.</p></section>
      </div>}

      {activeTab === 'data' && <div className="settings-grid">
        <section className="card settings-card" aria-labelledby="data-heading"><div className="settings-card__heading"><Download size={20} aria-hidden="true" /><h2 id="data-heading">Export your data</h2></div><p className="settings-help">Download a copy of your StudyFlow subjects and tasks.</p><div className="data-counts"><span className="badge badge--neutral">{subjects.length} subjects</span><span className="badge badge--neutral">{tasks.length} tasks</span></div><div className="settings-actions"><Button variant="secondary" icon={<Download size={16} aria-hidden="true" />} onClick={downloadExport} disabled={subjects.length === 0 && tasks.length === 0}>Download JSON</Button></div></section>
        <section className="card settings-card" aria-labelledby="clear-data-heading"><div className="settings-card__heading"><Trash2 size={20} aria-hidden="true" /><h2 id="clear-data-heading">Delete all my data</h2></div><p className="settings-help">Remove all subjects and tasks while keeping your account and login.</p><div className="settings-actions"><Button variant="danger" onClick={() => setIsResetOpen(true)}>Delete all my data</Button></div></section>
        <section className="card settings-card" aria-labelledby="privacy-heading"><h2 id="privacy-heading">Privacy</h2><p className="settings-help">Your subjects and tasks are stored in your StudyFlow account, and only you can see them.</p></section>
      </div>}
      {activeTab === 'security' && <div className="settings-security-grid">
        <div className="settings-security-column">
          <section className="card settings-card settings-security-card" aria-labelledby="email-security-heading">
            <div className="settings-card__heading"><span className="settings-card__icon"><Mail size={20} aria-hidden="true" /></span><div><h2 id="email-security-heading">Email address</h2><p className="settings-help">Your current email is <strong>{user?.email}</strong>. <span className="badge badge--success">Verified</span></p></div></div>
            <form className="settings-form" onSubmit={changeEmail}>
              <FormField id="new-email" label="New email address"><input id="new-email" className="input" type="email" autoComplete="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="you@university.edu" /></FormField>
              <div className="settings-actions"><Button type="submit" disabled={emailLoading}>{emailLoading ? 'Saving…' : 'Change email'}</Button></div>
            </form>
            {emailMessage && <p className={emailMessage.error ? 'auth-error' : 'auth-success'} role="status">{emailMessage.text}</p>}
          </section>
          <section className="card settings-card settings-security-card" aria-labelledby="sessions-heading">
            <div className="settings-card__heading"><span className="settings-card__icon"><Monitor size={20} aria-hidden="true" /></span><div><h2 id="sessions-heading">Sessions</h2><p className="settings-help">Sign out of StudyFlow on every device.</p></div></div>
            <div className="settings-actions"><Button variant="secondary" onClick={signOutAll}>Sign out of all devices</Button></div>
          </section>
          <section className="card settings-card settings-security-card settings-card--danger" aria-labelledby="danger-heading">
            <div className="settings-card__heading"><span className="settings-card__icon"><TriangleAlert size={20} aria-hidden="true" /></span><div><h2 id="danger-heading" className="settings-card__danger-title">Delete account</h2><p className="settings-help">Permanently delete your account and all associated data.</p></div></div>
            <div className="settings-actions"><Button variant="danger" onClick={() => setIsDeleteOpen(true)}>Delete account</Button></div>
          </section>
        </div>
        <div className="settings-security-column">
          {hasPasswordIdentity && <section className="card settings-card settings-security-card" aria-labelledby="password-security-heading">
            <div className="settings-card__heading"><span className="settings-card__icon"><KeyRound size={20} aria-hidden="true" /></span><div><h2 id="password-security-heading">Password</h2><p className="settings-help">Confirm your current password before choosing a new one.</p></div></div>
            <form className="settings-form" onSubmit={changePassword}>
              <PasswordInput id="current-password" label="Current password" autoComplete="current-password" value={currentPassword} error={currentPasswordError} onChange={(event) => { setCurrentPassword(event.target.value); setCurrentPasswordError('') }} />
              <PasswordInput id="settings-new-password" label="New password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              <PasswordStrength password={newPassword} id="settings-password-strength" />
              <PasswordInput id="settings-confirm-password" label="Confirm new password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              <div className="settings-actions"><Button type="submit" disabled={passwordLoading}>{passwordLoading ? 'Saving…' : 'Update password'}</Button><span className="settings-help">You'll stay signed in on this device.</span></div>
            </form>
            {passwordMessage && <p className={passwordMessage.error ? 'auth-error' : 'auth-success'} role="status">{passwordMessage.text}</p>}
          </section>}
        </div>
      </div>}
      {isResetOpen && <ConfirmDialog title="Clear all data?" description="This will delete all subjects, all tasks, and any related stored app data. This cannot be undone. Your theme preference will not be deleted." confirmLabel="Clear all data" onConfirm={handleClearData} onCancel={() => setIsResetOpen(false)} />}
      {isDeleteOpen && <DeleteAccountDialog onCancel={() => setIsDeleteOpen(false)} onDelete={deleteAccount} />}
    </>
  )
}
