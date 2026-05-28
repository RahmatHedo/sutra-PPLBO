export function getTodayShort(locale = 'id-ID') {
  return new Date().toLocaleDateString(locale, {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export function getTodayString(locale = 'id-ID') {
  return new Date().toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

export function formatDateID(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}
