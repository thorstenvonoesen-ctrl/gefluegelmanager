export function exportToCsv(filename, rows) {
  if (!rows || rows.length === 0) {
    alert("Keine Daten zum Exportieren vorhanden.");
    return;
  }

  const headers = Object.keys(rows[0]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`)
        .join(";")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  URL.revokeObjectURL(link.href);
}
