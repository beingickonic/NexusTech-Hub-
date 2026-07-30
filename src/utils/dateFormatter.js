export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
};

export const getRelativeTime = (dateStr) => {
  if (!dateStr) return 'Just now';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Just now';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = date - new Date();
  const mins = Math.round(diff / 60000);
  const hrs = Math.round(diff / 3600000);
  const days = Math.round(diff / 86400000);

  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
  if (Math.abs(hrs) < 24) return rtf.format(hrs, 'hour');
  return rtf.format(days, 'day');
};
