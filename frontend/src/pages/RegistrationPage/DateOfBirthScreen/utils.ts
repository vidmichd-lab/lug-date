/**
 * Utility functions for date validation and age calculation
 */

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check if date is valid
 */
export function isValidDate(day: number, month: number, year: number): boolean {
  // Check if date exists in calendar
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * Check if date is in the future
 */
export function isFutureDate(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date > today;
}

/**
 * Validate date and age
 */
export function validateDateOfBirth(
  day: string,
  month: string,
  year: string
): {
  isValid: boolean;
  error: 'invalid-date' | 'under-age' | 'future-date' | null;
  age: number | null;
} {
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // Check if all fields are filled
  if (!day || !month || !year) {
    return { isValid: false, error: null, age: null };
  }

  // Check if date is valid
  if (!isValidDate(dayNum, monthNum, yearNum)) {
    return { isValid: false, error: 'invalid-date', age: null };
  }

  // Check if date is in the future
  if (isFutureDate(dayNum, monthNum, yearNum)) {
    return { isValid: false, error: 'future-date', age: null };
  }

  // Calculate age
  const birthDate = new Date(yearNum, monthNum - 1, dayNum);
  const age = calculateAge(birthDate);

  // Check if age is 18+
  if (age < 18) {
    return { isValid: false, error: 'under-age', age };
  }

  return { isValid: true, error: null, age };
}
