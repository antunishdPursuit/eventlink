// Account continuations are limited to public event discovery on this app.
export function eventReturnTo(search) {
  const value = new URLSearchParams(search).get('returnTo');
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  try {
    const url = new URL(value, 'http://eventlink.local');
    return url.origin === 'http://eventlink.local' && url.pathname === '/events'
      ? url.pathname + url.search + url.hash : null;
  } catch { return null; }
}

export function accountDestination(search, userId, fallback = '/users/' + userId) {
  return eventReturnTo(search) || fallback;
}

export function accountLink(path, search) {
  const destination = eventReturnTo(search);
  return path + (destination ? '?returnTo=' + encodeURIComponent(destination) : '');
}
