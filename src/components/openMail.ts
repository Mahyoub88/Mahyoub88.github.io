/** Opens the mail client without putting the address in the page's markup, so it is not harvested by scrapers reading static HTML. */
export function openMail(address: string) {
  window.location.href = `mailto:${address}`
}
