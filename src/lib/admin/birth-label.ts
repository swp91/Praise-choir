export function parseBirthLabel(label: string | null | undefined): { month: string; day: string } {
  if (!label) return { month: '', day: '' };

  const match = label.match(/(?:음\s*)?(\d+)[.\s/]+(\d+)/);
  if (match) return { month: String(Number(match[1])), day: String(Number(match[2])) };

  return { month: '', day: '' };
}
