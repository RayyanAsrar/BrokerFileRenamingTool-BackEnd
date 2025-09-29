// Regexes
const dateRegex =
  /\b(?:\d{4}[-/](0?[1-9]|1[0-2])|(0?[1-9]|1[0-2])[-/]\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s?\d{4})\b/gi;

const periodRegex =
  /\b\d{4}[-/](0?[1-9]|1[0-2])\s?(to|-|–)\s?\d{4}[-/](0?[1-9]|1[0-2])\b/gi;

const issuerRegex =
  /\b(ANZ|Westpac|NAB|Commonwealth|CBA|AMP|Macquarie|HSBC|Citibank|Suncorp|ING|St\.? George|Bank of Melbourne)\b/gi;

const employerRegex = /\b[A-Z]{2,}(?:\s[A-Z]{2,})*\b/g;

// DocType detection
function detectDocType(text) {
  text = text.toLowerCase();
  if (text.includes("payslip")) return "Payslip";
  if (text.includes("bank statement")) return "BankStatement";
  if (text.includes("tax return")) return "TaxReturn";
  if (text.includes("passport") || text.includes("driver")) return "ID";
  return null;
}

// Metadata extractor with confidence
export function extractMetadata(text, data) {
  const { clientName, subClientName, fileExtension } = data;

  const date = (text.match(dateRegex) || [null])[0];
  const period = (text.match(periodRegex) || [null])[0];
  const issuer = (text.match(issuerRegex) ||
    text.match(employerRegex) || [null])[0];
  const client =
    clientName && new RegExp(clientName, "i").test(text) ? clientName : null;
  const subClient =
    subClientName && new RegExp(subClientName, "i").test(text)
      ? subClientName
      : null;
  const docType = detectDocType(text);
  const extentionname = fileExtension;

  const metadata = {
    date: { value: date, confidence: date ? 1 : -0.2 },
    period: { value: period, confidence: period ? 1 : -0.2 },
    issuer: { value: issuer, confidence: issuer ? 1 : -0.2 },
    client: { value: client, confidence: client ? 1 : -0.2 },
    subClientName: { value: subClient, confidence: subClient ? 1 : -0.2 },
    docType: { value: docType, confidence: docType ? 1 : -0.2 },
    extentionname: { value: extentionname, confidence: extentionname ? 1 : -0.2 },
  };

  const confidenceValues = Object.values(metadata).map((f) => f.confidence);
  const totalConfidence =
    confidenceValues.reduce((sum, val) => sum + val, 0) /
    confidenceValues.length;

  return { ...metadata, totalConfidence };
}
