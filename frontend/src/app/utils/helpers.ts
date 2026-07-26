const CATEGORY_ICONS: Record<string, string> = {
  Education: '🎓',
  Healthcare: '❤️',
  Agriculture: '🌾',
  Employment: '💼',
  Finance: '💰',
  'Women & Child Welfare': '👩‍👧',
  Housing: '🏠',
  Environment: '🌿',
  'Digital Governance': '💻',
  Infrastructure: '🏗️',
  Scholarships: '🎓',
  'Farmer Welfare': '🌾',
  'Business Support': '🏢',
  'Women Empowerment': '👩',
  'Senior Citizen Welfare': '👴',
  'Student Schemes': '📚',
  'Employment Programs': '🛠️',
  'Social Security': '🛡️',
};

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || '📋';
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getLaunchYear(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).getFullYear().toString();
}

export function parseIncome(income: string): number {
  if (income.includes('Below')) return 100000;
  if (income.includes('Above')) return 600000;
  const match = income.match(/₹([\d,]+)\s*-\s*₹([\d,]+)/);
  if (match) return parseInt(match[2].replace(/,/g, ''), 10);
  return 250000;
}

export function mapDisability(status: string): string {
  if (status === 'No Disability') return 'None';
  if (status.includes('Physical') || status.includes('Visual') || status.includes('Other')) return 'Partial';
  return 'Any';
}

export function formatStatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M+`;
  if (n >= 1000) return `${n.toLocaleString('en-IN')}+`;
  return n.toString();
}
