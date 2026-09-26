/**
 * Resolves a given path against the application's base URL (e.g. GitHub Pages subpath).
 *
 * In GitHub Pages (BASE_URL = '/SIH-2026-project/'):
 *   getAppPath('/') => '/SIH-2026-project/'
 *   getAppPath('/login') => '/SIH-2026-project/login'
 *   getAppPath('https://external.com') => 'https://external.com'
 *
 * In local dev (BASE_URL = '/' or './'):
 *   getAppPath('/') => '/'
 *   getAppPath('/login') => '/login'
 */
export function getAppPath(path = '/') {
  if (!path) return import.meta.env.BASE_URL || '/';

  // Keep external links untouched
  if (/^https?:\/\//i.test(path) || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path;
  }

  let base = import.meta.env.BASE_URL || '/';
  if (base === './' || base === '.') {
    base = '/';
  }

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // If path already starts with normalizedBase, don't duplicate
  if (normalizedBase && (normalizedPath === normalizedBase || normalizedPath.startsWith(`${normalizedBase}/`))) {
    return normalizedPath;
  }

  return `${normalizedBase}${normalizedPath}` || '/';
}
