import { jsPDF } from "jspdf";

export function exportAnimalsPdf(animals) {
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("GeflügelManager - Tierbestand", 10, 15);

  let y = 30;

  animals.forEach((animal, index) => {
    pdf.text(
      `${index + 1}. ${animal.ringNr} | ${animal.art} | ${animal.rasse} | ${animal.geschlecht}`,
      10,
      y
    );

    y += 10;

    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });

  pdf.save("tierbestand.pdf");
}
