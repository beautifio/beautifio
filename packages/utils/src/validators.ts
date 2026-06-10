export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): {
  valid: boolean;
  checks: { label: string; passed: boolean }[];
} {
  const checks = [
    { label: "Minimal 8 karakter", passed: password.length >= 8 },
    { label: "Mengandung huruf besar", passed: /[A-Z]/.test(password) },
    { label: "Mengandung huruf kecil", passed: /[a-z]/.test(password) },
    { label: "Mengandung angka", passed: /\d/.test(password) },
  ];

  return {
    valid: checks.every((c) => c.passed),
    checks,
  };
}

export function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
