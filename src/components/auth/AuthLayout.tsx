import { Check, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'

function WeeklyBarChart() {
  const bars = [
    ['S', 'short', 'light'], ['M', 'tall', 'mid'], ['T', 'medium', 'light'],
    ['W', 'highest', 'strong'], ['T', 'medium-tall', 'mid'], ['F', 'tall', 'strong'], ['S', 'short', 'empty'],
  ]
  return <div className="auth-chart" aria-label="Weekly study progress: Wednesday has the most progress">
    {bars.map(([day, height, color], index) => <div className="auth-chart__day" key={`${day}-${index}`}>
      <span className={`auth-chart__bar auth-chart__bar--${height} auth-chart__bar--${color}`} style={{ animationDelay: `${index * 70}ms` }} />
      <span className={day === 'W' ? 'is-active' : ''}>{day}</span>
    </div>)}
  </div>
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth-page">
    <div className="auth-shell">
      <section className="auth-hero" aria-label="About StudyFlow">
        <div className="auth-brand"><span className="auth-brand__mark"><TrendingUp size={29} strokeWidth={2.6} /><i /></span><span>StudyFlow</span></div>
        <div className="auth-hero__copy"><h1><span>Plan your studies.</span> <span>See your progress.</span></h1><p>Subjects, deadlines and weekly progress in one calm place, built for students.</p></div>
        <WeeklyBarChart />
        <ul className="auth-benefits">
          {['Organise tasks by subject', 'See every deadline on a calendar', 'Track your progress week by week'].map((text) => <li key={text}><Check size={15} strokeWidth={3} />{text}</li>)}
        </ul>
      </section>
      <section className="auth-panel">{children}</section>
    </div>
  </main>
}
