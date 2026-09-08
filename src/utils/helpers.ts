export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';

  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr.trim();
  }

  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  const h = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2);
  if (isNaN(h)) return timeStr;

  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function getStatusBadgeVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'teal' {
  switch (status) {
    case 'CONFIRMED':
      return 'info';
    case 'CHECKED_IN':
      return 'purple';
    case 'CHECKED_OUT':
      return 'teal';
    case 'IN_CONSULTATION':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    case 'RESCHEDULED':
      return 'warning';
    case 'NO_SHOW':
      return 'danger';
    case 'Active':
      return 'success';
    case 'Inactive':
      return 'danger';
    case 'Available':
      return 'success';
    case 'Booked':
      return 'info';
    case 'Blocked':
      return 'warning';
    case 'Unavailable':
      return 'danger';
    default:
      return 'default';
  }
}

export function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(header => {
          const val = row[header] ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
