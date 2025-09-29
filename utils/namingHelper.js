export function generateFileName(template, metadata) {
  return template
    .replace("{Client}", sanitize(metadata.client) || "UnknownClient")
    .replace("{SubClient}", sanitize(metadata.subClientName) || "")
    .replace("{DocType}", sanitize(metadata.docType) || "UnknownDoc")
    .replace("{Issuer}", sanitize(metadata.issuer) || "UnknownIssuer")
    .replace("{Date}", sanitize(metadata.date) || "UnknownDate")
    .replace("{Period}", sanitize(metadata.period) || "UnknownPeriod")
    .replace("{Ref}", sanitize(metadata.ref) || "NoRef");
}

function sanitize(str) {
  if (!str) return null;
  return String(str)
    .replace(/[\/\\?%*:|"<>]/g, "")
    .replace(/\s+/g, "")
    .trim();
}
