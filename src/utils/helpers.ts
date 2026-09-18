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

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  if (!rows || !Array.isArray(rows) || rows.length === 0 || !rows[0] || typeof rows[0] !== 'object') return;
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

export type SlotAvailabilityStatus = 'AVAILABLE' | 'BOOKED' | 'UNAVAILABLE';

/**
 * Resolves a slot to exactly one of three states with explicit priority:
 * A. If an active appointment exists for exact doctor/date/time: BOOKED
 * B. Else if selected date is before today: UNAVAILABLE
 * C. Else if selected date is today AND slot time has already passed: UNAVAILABLE
 * D. Otherwise: AVAILABLE
 */
export function getSlotAvailabilityStatus(
  slotTimeStr: string,
  selectedDateStr: string,
  bookedSlots: Set<string> | string[],
  now: Date = new Date()
): SlotAvailabilityStatus {
  const bookedSet = bookedSlots instanceof Set ? bookedSlots : new Set(bookedSlots);

  // A. Exact Doctor/Date/Time booked active appointment
  if (bookedSet.has(slotTimeStr)) {
    return 'BOOKED';
  }

  const todayStr = getLocalDateString(now);

  // B. Selected date is in the past
  if (selectedDateStr < todayStr) {
    return 'UNAVAILABLE';
  }

  // C. Selected date is today and clock time has passed
  if (selectedDateStr === todayStr) {
    const parts = slotTimeStr.split(':');
    if (parts.length >= 2) {
      const slotMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotMinutes <= currentMinutes) {
        return 'UNAVAILABLE';
      }
    }
  }

  // D. Otherwise available
  return 'AVAILABLE';
}

