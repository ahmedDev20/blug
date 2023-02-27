const intl = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});

export function formatDate(timestamp: string | number): string {
  return intl.format(new Date(timestamp));
}
