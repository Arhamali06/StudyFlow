interface AvatarProps {
  name?: string
  email?: string
  userId?: string
  size?: 'profile' | 'chip'
}

export default function Avatar({ name = '', email = '', size = 'chip' }: AvatarProps) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const initials = words.length > 1
    ? `${words[0][0]}${words[1][0]}`
    : (words[0]?.[0] ?? email[0] ?? '?')
  return (
    <span
      className={`avatar avatar--${size}`}
      aria-hidden="true"
    >
      {initials.toUpperCase()}
    </span>
  )
}
