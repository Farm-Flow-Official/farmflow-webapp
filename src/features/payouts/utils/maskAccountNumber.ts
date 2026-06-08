/**
 * PDPA data-minimisation helper. Reveals only the last 4 digits of a bank
 * account number for list / overview contexts, e.g. "1234567890" → "••••••7890".
 * The full number is shown only on the access-controlled detail view where a
 * FINANCE/MASTER admin needs it to perform the transfer.
 */
export function maskAccountNumber(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, '')
  if (digits.length <= 4) return digits
  const last4 = digits.slice(-4)
  return '•'.repeat(digits.length - 4) + last4
}
