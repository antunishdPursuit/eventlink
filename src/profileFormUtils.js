export function isProfileImageUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && /\.(jpe?g|png)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

export function localDateValue() {
  const today = new Date();
  return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
}

export function displayProfileDate(value) {
  if (!value) return '';
  const date = new Date(value.slice(0, 10) + 'T12:00:00');
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
