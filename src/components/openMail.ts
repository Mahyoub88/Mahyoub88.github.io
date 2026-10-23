/** Opens the mail client without putting the address in the page's markup, so it is not harvested by scrapers reading static HTML. */
export function openMail(address: string) {
  // Mail has no anchor for the analytics click listener to see, so report it explicitly (no-op when analytics is off).
  ;(window as { vaTrack?: (name: string) => void }).vaTrack?.('email')
  window.location.href = `mailto:${address}`
}
