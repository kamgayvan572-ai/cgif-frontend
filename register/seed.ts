// ─── prisma/seed.ts ───────────────────────────────────────────────────────────
// Seed complet CGIF — 15 clusters réels + comptes de démo
// Run : npx tsx prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed CGIF démarré…');

  // ── 1. Purge dans l'ordre des dépendances ─────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.kycRecord.deleteMany();
  await prisma.parrainage.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cluster.deleteMany();
  console.log('  ✓ Données existantes supprimées');

  // ── 2. Créer les 15 clusters CGIF ─────────────────────────────────────────
  const clusters = [
    // ENGINEERING
    { id: 'cluster-e1',  code: 'E1',  domain: 'engineering', color: '#2563EB', name: 'Mechanical & Manufacturing Engineering',             description: 'Génie mécanique, mécatronique, robotique, thermique, production et maintenance' },
    { id: 'cluster-e2',  code: 'E2',  domain: 'engineering', color: '#059669', name: 'Electrical, Electronic & Communication Engineering', description: 'Génie électrique, microélectronique, télécommunications, automatisme, optique et photonique' },
    { id: 'cluster-e3',  code: 'E3',  domain: 'engineering', color: '#7C3AED', name: 'Computer & Digital Engineering',                     description: 'Génie informatique, logiciel, données, intelligence artificielle et systèmes' },
    { id: 'cluster-e4',  code: 'E4',  domain: 'engineering', color: '#C8821A', name: 'Civil, Infrastructure & Environmental Engineering',  description: 'Génie civil, construction, hydraulique, transport et géomatique' },
    { id: 'cluster-e5',  code: 'E5',  domain: 'engineering', color: '#DC2626', name: 'Chemical & Process Engineering',                     description: 'Génie chimique, procédés, alimentaire et textile' },
    { id: 'cluster-e6',  code: 'E6',  domain: 'engineering', color: '#0D2818', name: 'Natural Resources & Energy Engineering',             description: 'Mines, pétrole, forêts, agriculture, géologie, énergie et nucléaire' },
    { id: 'cluster-e7',  code: 'E7',  domain: 'engineering', color: '#0891B2', name: 'Aerospace, Marine & Transport Engineering',          description: 'Aérospatial, espace, génie maritime et naval' },
    { id: 'cluster-e8',  code: 'E8',  domain: 'engineering', color: '#6D28D9', name: 'Materials & Advanced Technology Engineering',        description: 'Matériaux et nanotechnologies' },
    { id: 'cluster-e9',  code: 'E9',  domain: 'engineering', color: '#B45309', name: 'Industrial & Systems Engineering',                   description: 'Génie industriel et logistique' },
    { id: 'cluster-e10', code: 'E10', domain: 'engineering', color: '#065F46', name: 'Health & Environmental Engineering',                 description: 'Biomédical, environnement et acoustique' },
    // AUTRES DISCIPLINES
    { id: 'cluster-c1',  code: 'C1',  domain: 'health',      color: '#DC2626', name: 'Health Sciences',                                   description: 'Médecine, pharmacie, dentisterie, soins infirmiers, santé publique et nutrition' },
    { id: 'cluster-c2',  code: 'C2',  domain: 'business',    color: '#D97706', name: 'Business, Economics & Management',                  description: 'Administration, finance, marketing, comptabilité, entrepreneuriat et opérations' },
    { id: 'cluster-c3',  code: 'C3',  domain: 'education',   color: '#7C3AED', name: 'Education & Learning Sciences',                     description: 'Éducation, pédagogie et didactique' },
    { id: 'cluster-c4',  code: 'C4',  domain: 'arts',        color: '#DB2777', name: 'Arts, Design & Creative Industries',                description: 'Design et architecture' },
    { id: 'cluster-c5',  code: 'C5',  domain: 'law',         color: '#0284C7', name: 'Droit & Gouvernance',                               description: 'Droit, relations internationales et administration publique' },
  ];

  for (const cluster of clusters) {
    await prisma.cluster.create({ data: { ...cluster, active: true } });
  }
  console.log(`  ✓ ${clusters.length} clusters créés`);

  // ── 3. Comptes de démo ────────────────────────────────────────────────────
  const adminHash  = await bcrypt.hash('Admin@CGIF2024!', 12);
  const memberHash = await bcrypt.hash('Member@CGIF2024!', 12);

  // Admin — fondateur CGIF
  const admin = await prisma.user.create({
    data: {
      id:             'admin-yvan',
      name:           'KJ. Yvan',
      email:          'yvan@cgif.cm',
      passwordHash:   adminHash,
      initials:       'KY',
      role:           'ADMIN',
      status:         'ACTIVE',
      kycStatus:      'APPROVED',
      country:        'Cameroun',
      city:           'Yaoundé',
      domain:         'e3-sft',
      specialization: 'e3-sft',
      clusterId:      'cluster-e3',
      bio:            'Fondateur & Administrateur principal de CGIF — Cameroon Global Intelligence Forum.',
    },
  });

  // Membre 1 — Amina Foko (Medicine, C1)
  const amina = await prisma.user.create({
    data: {
      id:             'member-amina',
      name:           'Dr. Amina Foko',
      email:          'amina@cgif.cm',
      passwordHash:   memberHash,
      initials:       'AF',
      role:           'MEMBER',
      status:         'ACTIVE',
      kycStatus:      'APPROVED',
      country:        'France',
      city:           'Paris',
      domain:         'c1-med',
      specialization: 'c1-med',
      clusterId:      'cluster-c1',
      bio:            'Médecin spécialiste en santé publique, diaspora camerounaise en France.',
    },
  });

  // Membre 2 — Jean-Baptiste Mbarga (Software Engineering, E3)
  const jean = await prisma.user.create({
    data: {
      id:             'member-jean',
      name:           'Jean-Baptiste Mbarga',
      email:          'jean@cgif.cm',
      passwordHash:   memberHash,
      initials:       'JM',
      role:           'MEMBER',
      status:         'ACTIVE',
      kycStatus:      'PENDING',
      country:        'Canada',
      city:           'Montréal',
      domain:         'e3-sft',
      specialization: 'e3-sft',
      clusterId:      'cluster-e3',
    },
  });

  // Membre 3 — Marie Ngono (Finance, C2)
  const marie = await prisma.user.create({
    data: {
      id:             'member-marie',
      name:           'Marie Ngono',
      email:          'marie@cgif.cm',
      passwordHash:   memberHash,
      initials:       'MN',
      role:           'MEMBER',
      status:         'PENDING',
      kycStatus:      'NONE',
      country:        'Belgique',
      city:           'Bruxelles',
      domain:         'c2-fin',
      specialization: 'c2-fin',
      clusterId:      'cluster-c2',
    },
  });

  console.log('  ✓ 4 comptes créés (1 admin + 3 membres)');

  // ── 4. KYC records ────────────────────────────────────────────────────────
  await prisma.kycRecord.createMany({
    data: [
      { memberId: admin.id,  status: 'APPROVED' },
      { memberId: amina.id,  status: 'APPROVED' },
      { memberId: jean.id,   status: 'PENDING'  },
      { memberId: marie.id,  status: 'NONE'     },
    ],
  });

  // ── 5. Projets de démo ────────────────────────────────────────────────────
  const p1 = await prisma.project.create({
    data: {
      title:            'Centre de Santé Numérique — Douala',
      description:      'Déploiement d\'un système de gestion hospitalière numérique pour 3 centres de santé à Douala. Intégration télémédecine et dossiers patients électroniques.',
      clusterId:        'cluster-c1',
      status:           'FUNDING',
      targetAmount:     150,
      collectedAmount:  87,
      progress:         58,
      startDate:        new Date('2024-03-01'),
      endDate:          new Date('2025-06-30'),
    },
  });

  const p2 = await prisma.project.create({
    data: {
      title:            'Parc Solaire — Région Adamaoua',
      description:      'Installation de 500 panneaux solaires pour alimenter 3 villages ruraux de la région Adamaoua. Production estimée : 2 MW.',
      clusterId:        'cluster-e6',
      status:           'FUNDING',
      targetAmount:     200,
      collectedAmount:  60,
      progress:         30,
      startDate:        new Date('2024-06-01'),
      endDate:          new Date('2025-12-31'),
    },
  });

  const p3 = await prisma.project.create({
    data: {
      title:            'Plateforme EdTech Cameroun',
      description:      'Application mobile d\'apprentissage adaptatif pour les lycéens camerounais. Contenu en français et anglais.',
      clusterId:        'cluster-e3',
      status:           'REVIEW',
      targetAmount:     80,
      collectedAmount:  0,
      progress:         0,
    },
  });

  console.log('  ✓ 3 projets créés');

  // ── 6. Investissements de démo ────────────────────────────────────────────
  await prisma.investment.create({
    data: {
      memberId:     amina.id,
      projectId:    p1.id,
      amount:       25000,
      sharesCount:  5,
      sharePrice:   5000,
      status:       'ACTIVE',
      paymentMethod:'VIREMENT_SEPA',
      refVirement:  'CGIF-AF-2024-001',
      submittedAt:  new Date('2024-04-10'),
    },
  });

  await prisma.investment.create({
    data: {
      memberId:     jean.id,
      projectId:    p2.id,
      amount:       15000,
      sharesCount:  3,
      sharePrice:   5000,
      status:       'VOEU_SOUMIS',
      paymentMethod:'VIREMENT_SEPA',
      refVirement:  'CGIF-JM-2024-002',
      submittedAt:  new Date('2024-05-15'),
    },
  });

  console.log('  ✓ 2 investissements créés');

  // ── 7. Annonce de bienvenue ───────────────────────────────────────────────
  await prisma.announcement.create({
    data: {
      title:    'Bienvenue sur la plateforme CGIF',
      body:     'CGIF — Cameroon Global Intelligence Forum est maintenant en ligne. Rejoignez vos pairs de la diaspora pour investir ensemble dans le développement du Cameroun.',
      scope:    'platform',
      priority: 'high',
      status:   'published',
      views:    0,
    },
  });

  // ── 8. Notification de bienvenue admin ───────────────────────────────────
  await prisma.notification.create({
    data: {
      userId:  admin.id,
      title:   'Plateforme initialisée',
      message: '15 clusters, 4 membres de démo et 3 projets ont été créés avec succès.',
      type:    'success',
      icon:    '🚀',
    },
  });

  console.log('  ✓ Annonce + notifications créées');
  console.log('');
  console.log('✅ Seed terminé avec succès !');
  console.log('');
  console.log('Comptes de connexion :');
  console.log('  Admin  : yvan@cgif.cm  / Admin@CGIF2024!');
  console.log('  Membre : amina@cgif.cm / Member@CGIF2024!');
  console.log('  Membre : jean@cgif.cm  / Member@CGIF2024!');
}

main()
  .catch(e => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
