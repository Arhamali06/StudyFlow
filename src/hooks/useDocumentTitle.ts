import { useEffect } from 'react'

/** Sets the browser tab title, e.g. "My Tasks · StudyFlow". */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} · StudyFlow` : 'StudyFlow'
  }, [title])
}
