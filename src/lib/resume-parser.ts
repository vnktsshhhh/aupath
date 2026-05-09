export async function extractTextFromFile(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  if (fileType === "application/pdf" || fileType.includes("pdf")) {
    return extractFromPdf(buffer);
  }
  if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileType.includes("docx") ||
    fileType.includes("word")
  ) {
    return extractFromDocx(buffer);
  }
  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  // pdf-parse v2 uses named exports
  const pdfModule = await import("pdf-parse");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParse: (buf: Buffer) => Promise<{ text: string }> =
    (pdfModule as any).default ?? (pdfModule as any);
  const result = await pdfParse(buffer);
  return result.text.trim();
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}
