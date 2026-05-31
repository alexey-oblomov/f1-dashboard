export function getBasename(): string | undefined {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '')
  return basename || undefined
}
