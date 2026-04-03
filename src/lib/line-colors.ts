/**
 * Returns background color and text color for a transport line badge.
 */
export function getLineBadgeStyle(productName: string, lineName: string): { bg: string; text: string } {
  const p = productName?.toLowerCase() || '';
  const l = lineName?.toLowerCase() || '';

  if (p.includes('bus') || l.startsWith('bus')) return { bg: '#1D4ED8', text: '#FFFFFF' };
  if (p.includes('suburban') || l.startsWith('s')) return { bg: '#16A34A', text: '#FFFFFF' };
  if (p.includes('tram') || p.includes('straßenbahn') || l.startsWith('stb') || l.startsWith('str') || l.startsWith('tram')) return { bg: '#EA580C', text: '#FFFFFF' };
  if (p.includes('nationalexpress') || p.includes('national') || l.startsWith('ice') || l.startsWith('ic')) return { bg: '#DC2626', text: '#FFFFFF' };
  if (p.includes('regional') || l.startsWith('re') || l.startsWith('rb')) return { bg: '#7C3AED', text: '#FFFFFF' };
  if (p.includes('subway') || l.startsWith('u')) return { bg: '#1D4ED8', text: '#FFFFFF' };
  if (p.includes('ferry') || p.includes('fähre')) return { bg: '#0891B2', text: '#FFFFFF' };

  return { bg: '#374151', text: '#FFFFFF' };
}
