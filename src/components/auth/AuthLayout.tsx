import { Check, TrendingUp } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

const BARS = [
  { day: 'S', height: 'short', tone: 'light' },
  { day: 'M', height: 'tall', tone: 'mid' },
  { day: 'T', height: 'medium', tone: 'light' },
  { day: 'W', height: 'highest', tone: 'strong' },
  { day: 'T', height: 'medium-tall', tone: 'mid' },
  { day: 'F', height: 'tall', tone: 'strong' },
  { day: 'S', height: 'short', tone: 'empty' },
] as const

function WeeklyBarChart() {
  return (
    <div className="auth-chart" role="img" aria-label="Weekly study progress: Wednesday has the most progress">
      {BARS.map(({ day, height, tone }, index) => (
        <div className="auth-chart__day" key={`${day}-${index}`} aria-hidden="true">
          <span
            className={`auth-chart__bar auth-chart__bar--${height} auth-chart__bar--${tone}`}
            style={{ animationDelay: `${index * 70}ms` }}
          />
          <span className={day === 'W' ? 'is-active' : ''}>{day}</span>
        </div>
      ))}
    </div>
  )
}

interface AuthLayoutProps {
  children: ReactNode
  /** Signup is a longer form, so on phones its header stays smaller and skips the chart. */
  variant: 'login' | 'signup'
}

export function AuthLayout({ children, variant }: AuthLayoutProps) {
  // Lets the stylesheet turn off the app's reserved scrollbar gutter on these full-screen pages.
  useEffect(() => {
    document.documentElement.classList.add('is-auth-page')
    return () => document.documentElement.classList.remove('is-auth-page')
  }, [])

  return (
    <main className={`auth-page auth-page--${variant}`}>
      <div className="auth-shell">
        <section className="auth-hero" aria-label="About StudyFlow">
          <div className="auth-brand">
            <span className="auth-brand__mark" aria-hidden="true">
              <TrendingUp size={29} strokeWidth={2.6} />
              <i />
            </span>
            <span>StudyFlow</span>
          </div>
          <div className="auth-hero__copy">
            <h1>
              <span>Plan your studies.</span> <span>See your progress.</span>
            </h1>
            <p>Subjects, deadlines and weekly progress in one calm place, built for students.</p>
          </div>
          <WeeklyBarChart />
          <ul className="auth-benefits">
            {['Organise tasks by subject', 'See every deadline on a calendar', 'Track your progress week by week'].map((text) => (
              <li key={text}>
                <Check size={15} strokeWidth={3} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </section>
        <section className="auth-panel">{children}</section>
      </div>
    </main>
  )
}
