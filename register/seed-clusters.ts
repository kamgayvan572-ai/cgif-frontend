// ─── Extrait à intégrer dans prisma/seed.ts ────────────────────────────────
// Remplacez votre ancien bloc de création de clusters par celui-ci

const CLUSTERS_DATA = [
  {
    id: 'cluster-e1',
    name: 'Mechanical & Manufacturing Engineering',
    description: 'Génie mécanique, mécatronique, robotique, thermique, production et maintenance',
    domain: 'engineering', code: 'E1', color: '#2563EB', active: true,
  },
  {
    id: 'cluster-e2',
    name: 'Electrical, Electronic & Communication Engineering',
    description: 'Génie électrique, microélectronique, télécommunications, automatisme, optique et photonique',
    domain: 'engineering', code: 'E2', color: '#059669', active: true,
  },
  {
    id: 'cluster-e3',
    name: 'Computer & Digital Engineering',
    description: 'Génie informatique, logiciel, données, intelligence artificielle et systèmes',
    domain: 'engineering', code: 'E3', color: '#7C3AED', active: true,
  },
  {
    id: 'cluster-e4',
    name: 'Civil, Infrastructure & Environmental Engineering',
    description: 'Génie civil, construction, hydraulique, transport et géomatique',
    domain: 'engineering', code: 'E4', color: '#C8821A', active: true,
  },
  {
    id: 'cluster-e5',
    name: 'Chemical & Process Engineering',
    description: 'Génie chimique, procédés, alimentaire et textile',
    domain: 'engineering', code: 'E5', color: '#DC2626', active: true,
  },
  {
    id: 'cluster-e6',
    name: 'Natural Resources & Energy Engineering',
    description: 'Mines, pétrole, forêts, agriculture, géologie, énergie et nucléaire',
    domain: 'engineering', code: 'E6', color: '#0D2818', active: true,
  },
  {
    id: 'cluster-e7',
    name: 'Aerospace, Marine & Transport Engineering',
    description: 'Aérospatial, espace, génie maritime et naval',
    domain: 'engineering', code: 'E7', color: '#0891B2', active: true,
  },
  {
    id: 'cluster-e8',
    name: 'Materials & Advanced Technology Engineering',
    description: 'Matériaux et nanotechnologies',
    domain: 'engineering', code: 'E8', color: '#6D28D9', active: true,
  },
  {
    id: 'cluster-e9',
    name: 'Industrial & Systems Engineering',
    description: 'Génie industriel et logistique',
    domain: 'engineering', code: 'E9', color: '#B45309', active: true,
  },
  {
    id: 'cluster-e10',
    name: 'Health & Environmental Engineering',
    description: 'Biomédical, environnement et acoustique',
    domain: 'engineering', code: 'E10', color: '#065F46', active: true,
  },
  {
    id: 'cluster-c1',
    name: 'Health Sciences',
    description: 'Médecine, pharmacie, dentisterie, soins infirmiers, santé publique et nutrition',
    domain: 'health', code: 'C1', color: '#DC2626', active: true,
  },
  {
    id: 'cluster-c2',
    name: 'Business, Economics & Management',
    description: 'Administration, finance, marketing, comptabilité, entrepreneuriat et opérations',
    domain: 'business', code: 'C2', color: '#D97706', active: true,
  },
  {
    id: 'cluster-c3',
    name: 'Education & Learning Sciences',
    description: 'Éducation, pédagogie et didactique',
    domain: 'education', code: 'C3', color: '#7C3AED', active: true,
  },
  {
    id: 'cluster-c4',
    name: 'Arts, Design & Creative Industries',
    description: 'Design et architecture',
    domain: 'arts', code: 'C4', color: '#DB2777', active: true,
  },
  {
    id: 'cluster-c5',
    name: 'Droit & Gouvernance',
    description: 'Droit, relations internationales et administration publique',
    domain: 'law', code: 'C5', color: '#0284C7', active: true,
  },
];

// Dans votre fonction seed() :
for (const cluster of CLUSTERS_DATA) {
  await prisma.cluster.upsert({
    where: { id: cluster.id },
    update: {},
    create: cluster,
  });
}

// Ajouter le champ specialization dans votre schema.prisma sur le modèle User :
// specialization  String?
