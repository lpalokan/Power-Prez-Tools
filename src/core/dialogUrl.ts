/**
 * Where the message dialog is opened. This is a pure decision, not an
 * Office.js call: given the page the add-in is served from, work out the
 * dialog.html URL. OfficeCommandHost feeds it location.href; the Cucumber
 * suite proves it without PowerPoint. See ADR-0006.
 *
 * Resolving relative to the add-in's own page keeps the GitHub Pages
 * project base path (/Power-Prez-Tools/); building from location.origin
 * dropped it and 404'd in production.
 */
export function resolveDialogUrl(baseHref: string, message: string): string {
  return new URL(
    `dialog.html?msg=${encodeURIComponent(message)}`,
    baseHref,
  ).toString();
}
