export function generateFileName(template, metadata) {
  return template
    .replace("{Client}", sanitize(metadata.client?.value) || "UnknownClient")
    .replace("{SubClient}", sanitize(metadata.subClientName?.value) || "")
    .replace("{DocType}", sanitize(metadata.docType?.value) || "UnknownDoc")
    .replace("{Issuer}", sanitize(metadata.issuer?.value) || "UnknownIssuer")
    .replace("{Date}", sanitize(metadata.date?.value) || "UnknownDate")
    .replace("{Period}", sanitize(metadata.period?.value) || "UnknownPeriod")
    .replace("{Ref}", sanitize(metadata.ref?.value) || "NoRef")
    .replace("{extentionname}", sanitize(metadata.extentionname?.value) || "pdf");
}

function sanitize(str) {
  if (!str) return null;
  return String(str)
    .replace(/[\/\\?%*:|"<>]/g, "")
    .replace(/\s+/g, "")
    .trim();
}
