const TEAM_LOGOS = {
  'arsenal': 'arsenal.png',
  'aston villa': 'aston-villa.png',
  'barcellona': 'barcellona.png',
  'barcelona': 'barcellona.png',
  'bayern monaco': 'bayern-monaco.png',
  'bayern munich': 'bayern-monaco.png',
  'boca juniors': 'boca-juniors.png',
  'chelsea': 'Chelsea.png',
  'inter': 'Inter.png',
  'manchester utd': 'ManchesterUtd.png',
  'manchester united': 'ManchesterUtd.png',
  'napoli': 'Napoli.png',
  'paris saint-germain': 'PSG.png',
  'psg': 'PSG.png',
  'real madrid': 'Real-Madrid.png',
  'river plate': 'river-plate.png',
  'torino': 'torino.png'
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getTeamLogoSrc = (teamName) => {
  if (!teamName) return null;
  const normalized = String(teamName).trim().toLowerCase();
  const mapped = TEAM_LOGOS[normalized];
  if (mapped) return `/logos/${mapped}`;
  return `/logos/${slugify(normalized)}.png`;
};
