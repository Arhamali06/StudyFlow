export function passwordStrength(password: string) {
  if (password.length < 8 || !/\d/.test(password)) return 1
  return /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 3 : 2
}
