import type { ReviewSnapshot } from "@/data/afterlogin/check-in-ops/types";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string | number) {
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export type ReviewExportMeta = {
  airlineLabel: string;
  scopeLabel: string;
  slaTargetPct: number;
  slaWindowMin: number;
};

/** Build Management Review CSV from the currently filtered snapshot. */
export function buildReviewCsv(view: ReviewSnapshot, meta: ReviewExportMeta): string {
  const lines: string[] = [
    "Section,Metric,Value",
    csvEscape("Filters"),
    ["Filters", "Island", meta.airlineLabel].map(csvEscape).join(","),
    ["Filters", "Scope", meta.scopeLabel].map(csvEscape).join(","),
    ["Filters", "Date range", view.kpis.dateRangeLabel].map(csvEscape).join(","),
    "",
    ["KPI", "Overall SLA compliance %", view.kpis.slaCompliance].map(csvEscape).join(","),
    ["KPI", "Flights analysed", view.kpis.flightsAnalysed].map(csvEscape).join(","),
    ["KPI", "Carrier", "Vietjet Air"].map(csvEscape).join(","),
    ["KPI", "Pax checked in", view.kpis.paxCheckedIn].map(csvEscape).join(","),
    ["KPI", "Breach episodes", view.kpis.breachEpisodes].map(csvEscape).join(","),
    ["KPI", "Structural breaches", view.kpis.structuralBreaches].map(csvEscape).join(","),
    ["KPI", "Ad-hoc breaches", view.kpis.adHocBreaches].map(csvEscape).join(","),
    ["KPI", "Pax impacted", view.kpis.paxImpacted].map(csvEscape).join(","),
    ["KPI", "Pax impacted %", view.kpis.paxImpactedPct].map(csvEscape).join(","),
    "",
    ["Summary", "Narrative", view.summary].map(csvEscape).join(","),
    "",
    "Island,SLA %,Flights,Breach episodes,Median est. join wait",
    ...view.league.map((row) =>
      [row.group, row.slaPct, row.flights, row.breaches, row.medianJoinWait]
        .map(csvEscape)
        .join(","),
    ),
    "",
    "Root cause category,Title,Detail",
    ...view.rootCauses.map((row) =>
      [row.category, row.title, row.detail].map(csvEscape).join(","),
    ),
  ];

  return `\uFEFF${lines.join("\n")}`;
}

function pdfEscape(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** Minimal single-page text PDF (no external PDF library). */
export function buildReviewPdf(view: ReviewSnapshot, meta: ReviewExportMeta): Blob {
  const lines = [
    "Airport Management Review",
    view.kpis.dateRangeLabel,
    `SLA target ${meta.slaTargetPct}% / ${meta.slaWindowMin} min`,
    `Island: ${meta.airlineLabel}`,
    `Scope: ${meta.scopeLabel}`,
    "",
    `Overall SLA: ${view.kpis.slaCompliance}%`,
    `Flights analysed: ${view.kpis.flightsAnalysed}`,
    `Carrier: Vietjet Air`,
    `Pax checked in: ${view.kpis.paxCheckedIn.toLocaleString()}`,
    `Breach episodes: ${view.kpis.breachEpisodes} (${view.kpis.structuralBreaches} structural / ${view.kpis.adHocBreaches} ad-hoc)`,
    `Pax impacted: ${view.kpis.paxImpacted.toLocaleString()} (${view.kpis.paxImpactedPct}%)`,
    "",
    "Summary",
    ...wrapText(view.summary, 88),
    "",
    "Island SLA league",
    "Island | SLA % | Flights | Breaches | Median est. wait",
    ...view.league.map(
      (row) =>
        `${row.group} | ${row.slaPct}% | ${row.flights} | ${row.breaches} | ${row.medianJoinWait}`,
    ),
    "",
    "Root causes",
    ...view.rootCauses.flatMap((row) => [
      `[${row.category.toUpperCase()}] ${row.title}`,
      ...wrapText(row.detail, 88),
      "",
    ]),
  ];

  const contentLines = lines
    .map((line, index) => {
      const y = 800 - index * 14;
      if (y < 40) return null;
      return `BT /F1 10 Tf 40 ${y} Td (${pdfEscape(line)}) Tj ET`;
    })
    .filter(Boolean)
    .join("\n");

  const objects: string[] = [];
  objects.push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj");
  objects.push("2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj");
  objects.push(
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj",
  );
  objects.push(`4 0 obj<< /Length ${contentLines.length} >>stream\n${contentLines}\nendstream endobj`);
  objects.push("5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLen) {
      if (current) out.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) out.push(current);
  return out;
}

export function downloadReviewCsv(
  view: ReviewSnapshot,
  meta: ReviewExportMeta,
  filename = "management-review.csv",
) {
  const csv = buildReviewCsv(view, meta);
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

export function downloadReviewPdf(
  view: ReviewSnapshot,
  meta: ReviewExportMeta,
  filename = "management-review.pdf",
) {
  downloadBlob(filename, buildReviewPdf(view, meta));
}
