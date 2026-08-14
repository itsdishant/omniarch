export const MAX_PROJECT_NAME_LENGTH = 120;

export function isValidProjectName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length > 0 && name.length <= MAX_PROJECT_NAME_LENGTH;
}
