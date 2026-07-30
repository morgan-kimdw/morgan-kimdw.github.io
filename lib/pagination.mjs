/** @param {string} pathname */
export function getPaginationBasePath(pathname) {
  return pathname
    .replace(/^\/+/, '')
    .replace(/\/page\/\d+\/?$/, '')
    .replace(/\/+$/, '')
}
