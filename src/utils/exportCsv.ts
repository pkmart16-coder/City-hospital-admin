/**
 * CSV Export utility with standard sanitization
 */

export function exportToCSV<T extends object>(
  filename: string,
  data: T[],
  headers?: { key: keyof T; label: string }[]
) {
  if (!data || data.length === 0) {
    alert('No records available to export.');
    return;
  }

  const columns = headers || (Object.keys(data[0]) as (keyof T)[]).map(key => ({
    key,
    label: String(key)
  }));

  const csvRows: string[] = [];

  // Header row
  csvRows.push(columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of data) {
    const values = columns.map(col => {
      const val = (row as Record<string, unknown>)[col.key as string];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
