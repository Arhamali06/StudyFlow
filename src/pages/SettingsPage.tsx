import { useState, type FormEvent } from 'react'
import { Info, Settings, Trash2, User } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FormField from '../components/ui/FormField'
import { DEFAULT_USER_NAME, USER_NAME_MAX_LENGTH } from '../lib/constants'
import { useAppData } from '../hooks/useAppData'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { ThemePreference } from '../types'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export default function SettingsPage() {
  useDocumentTitle('Settings')
  const { theme, setTheme } = useTheme()
  const { subjects, tasks, userName, setUserName, loadSampleData, clearAllData } = useAppData()
  const { showToast } = useToast()
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState(userName === DEFAULT_USER_NAME ? '' : userName)

  function handleSaveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setUserName(nameDraft)
    showToast(nameDraft.trim() ? 'Display name saved.' : 'Display name cleared.')
  }

  function handleSampleData() {
    const result = loadSampleData()
    if (result.ok) {
      showToast(
        subjects.length || tasks.length
          ? 'Sample data added without removing your existing data.'
          : 'Sample data loaded.',
      )
    } else {
      showToast(result.error, 'error')
    }
  }

  function handleClearData() {
    const stored = clearAllData()
    setIsResetOpen(false)
    showToast(stored ? 'All data cleared' : 'Data cleared in memory, but browser storage could not be updated.', stored ? 'success' : 'error')
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Make StudyFlow work the way you like." />
      <div className="settings-grid">
        <section className="card settings-card" aria-labelledby="profile-heading">
          <div className="settings-card__heading">
            <User size={20} aria-hidden="true" />
            <h2 id="profile-heading">Profile</h2>
          </div>
          <form className="settings-form" onSubmit={handleSaveName}>
            <FormField id="display-name" label="Display name" optional>
              <input
                id="display-name"
                className="input"
                type="text"
                autoComplete="given-name"
                maxLength={USER_NAME_MAX_LENGTH}
                placeholder="What should we call you?"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                aria-describedby="display-name-help"
              />
            </FormField>
            <p id="display-name-help" className="settings-help">Shown in the greeting on your Dashboard.</p>
            <div className="settings-actions">
              <Button type="submit" variant="secondary">Save name</Button>
            </div>
          </form>
        </section>

        <section className="card settings-card" aria-labelledby="appearance-heading">
          <div className="settings-card__heading">
            <Settings size={20} aria-hidden="true" />
            <h2 id="appearance-heading">Appearance</h2>
          </div>
          <fieldset className="field field--group">
            <legend className="field__label">Theme</legend>
            <div className="segmented">
              {THEME_OPTIONS.map((option) => (
                <label className="segmented__option" key={option.value}>
                  <input
                    type="radio"
                    name="theme"
                    value={option.value}
                    checked={theme === option.value}
                    onChange={() => setTheme(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <p className="settings-help">System follows your device setting.</p>
          </fieldset>
        </section>

        <section className="card settings-card" aria-labelledby="data-heading">
          <div className="settings-card__heading">
            <Trash2 size={20} aria-hidden="true" />
            <h2 id="data-heading">Data</h2>
          </div>
          <p className="settings-help">Manage your subjects and tasks stored in this browser.</p>
          <div className="settings-actions">
            <Button variant="secondary" onClick={handleSampleData}>Load sample data</Button>
            <Button variant="danger" onClick={() => setIsResetOpen(true)}>Clear all data</Button>
          </div>
        </section>

        <section className="card settings-card" aria-labelledby="about-heading">
          <div className="settings-card__heading">
            <Info size={20} aria-hidden="true" />
            <h2 id="about-heading">About</h2>
          </div>
          <p className="settings-about__name">StudyFlow</p>
          <p className="settings-help">
            A personal study planner for organizing tasks, subjects, deadlines and progress.
          </p>
          <p className="settings-help">
            Your data is stored only in this browser (localStorage). Clearing browser data or using
            another device will not carry your tasks over.
          </p>
        </section>
      </div>
      {isResetOpen && (
        <ConfirmDialog
          title="Clear all data?"
          description="This will delete all subjects, all tasks, and any related stored app data. This cannot be undone. Your theme preference will not be deleted."
          confirmLabel="Clear all data"
          onConfirm={handleClearData}
          onCancel={() => setIsResetOpen(false)}
        />
      )}
    </>
  )
}
