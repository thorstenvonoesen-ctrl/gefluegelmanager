import { jsPDF } from "jspdf";

function createPdf(title, rows, filename, formatRow) {
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text(title, 10, 15);

  let y = 30;

  rows.forEach((row, index) => {
    pdf.setFontSize(11);
    pdf.text(formatRow(row, index), 10, y);

    y += 10;

    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });

  pdf.save(filename);
}

export function exportAnimalsPdf(animals) {
  createPdf(
    "GeflügelManager - Tierbestand",
    animals,
    "tierbestand.pdf",
    (animal, index) =>
      `${index + 1}. ${animal.ringNr || "-"} | ${animal.art || "-"} | ${animal.rasse || "-"} | ${animal.geschlecht || "-"}`
  );
}

export function exportEggsPdf(eggEntries) {
  createPdf(
    "GeflügelManager - Eierbuch",
    eggEntries,
    "eierbuch.pdf",
    (entry, index) =>
      `${index + 1}. ${entry.date || "-"} | ${entry.count || 0} Eier`
  );
}

export function exportVaccinationsPdf(vaccinations) {
  createPdf(
    "GeflügelManager - Impfungen",
    vaccinations,
    "impfungen.pdf",
    (entry, index) =>
      `${index + 1}. ${entry.vaccination_date || "-"} | ${entry.vaccine || "-"}`
  );
}

export function exportHatchingsPdf(hatchings) {
  createPdf(
    "GeflügelManager - Brutbuch",
    hatchings,
    "brutbuch.pdf",
    (entry, index) =>
      `${index + 1}. ${entry.name || "-"} | Start: ${entry.start_date || "-"} | Eier: ${entry.egg_count || 0}`
  );
}
