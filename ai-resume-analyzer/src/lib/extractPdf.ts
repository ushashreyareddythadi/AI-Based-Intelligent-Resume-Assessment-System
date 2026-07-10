// Convert File to base64 (strip data URL prefix) for server-side PDF text extraction.
export async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const subarray = Array.from(bytes.subarray(i, i + chunk));
    binary += String.fromCharCode(...subarray);
  }
  return btoa(binary);
}

export async function readResumeAsText(file: File): Promise<{ text?: string; base64?: string; mimeType: string; fileName: string }> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    const base64 = await fileToBase64(file);
    return { base64, mimeType: "application/pdf", fileName: file.name };
  }
  // DOCX or plain text: send as text (best effort)
  const text = await file.text();
  return { text, mimeType: file.type || "text/plain", fileName: file.name };
}
