/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indonesian phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password minimal 8 karakter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Harus mengandung huruf besar');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Harus mengandung huruf kecil');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Harus mengandung angka');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
