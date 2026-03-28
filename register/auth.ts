// ─── src/routes/auth.ts ───────────────────────────────────────────────────────
// Authentification CGIF : register, login, refresh, logout
// Règles métier :
//   - 1 membre = 1 cluster (impossible d'en avoir plusieurs → champ unique)
//   - Spécialisation validée côté serveur par rapport au cluster déclaré
//   - Inscription en statut PENDING → admin valide via AdminMembersPage

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import {
  isValidCluster,
  isValidSpecialization,
  getSpecName,
  getClusterName,
} from '../data/clusters-validation.js';

const router = Router();

const JWT_SECRET         = process.env.JWT_SECRET || 'cgif-secret-dev';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'cgif-refresh-secret-dev';
const JWT_EXPIRES        = '2h';
const REFRESH_EXPIRES    = '30d';

const makeTokens = (userId: string, role: string) => ({
  accessToken:  jwt.sign({ userId, role }, JWT_SECRET,         { expiresIn: JWT_EXPIRES }),
  refreshToken: jwt.sign({ userId },       JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES }),
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /auth/register
// Règles :
//   - Email unique
//   - clusterId obligatoire + valide dans la liste des 15 clusters CGIF
//   - specialization obligatoire + appartient au cluster déclaré
//   - Un code parrainage valide crédite le parrain (+150 points)
//   - Statut : PENDING (admin doit valider)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/register', [
  body('name')           .trim().isLength({ min: 2, max: 100 }),
  body('email')          .isEmail().normalizeEmail(),
  body('password')       .isLength({ min: 8 }),
  body('country')        .trim().isLength({ min: 2 }),
  body('city')           .trim().isLength({ min: 2 }),
  body('clusterId')      .trim().notEmpty(),
  body('specialization') .trim().notEmpty(),
  body('phone')          .optional().trim(),
  body('refCode')        .optional().trim(),
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Données invalides', details: errors.array() });
  }

  const { name, email, password, country, city, phone, clusterId, specialization, refCode } = req.body;

  // ── 1. Valider le cluster ─────────────────────────────────────────────────
  if (!isValidCluster(clusterId)) {
    return res.status(400).json({
      error: 'Cluster invalide. Veuillez sélectionner un cluster CGIF valide.',
    });
  }

  // ── 2. Valider la spécialisation par rapport au cluster ───────────────────
  //    Garantit qu'on ne peut pas déclarer une spé qui n'appartient pas au cluster
  if (!isValidSpecialization(clusterId, specialization)) {
    return res.status(400).json({
      error: `La spécialisation "${specialization}" n'appartient pas au cluster sélectionné. Veuillez choisir une spécialisation correspondante.`,
    });
  }

  // ── 3. Vérifier que l'email n'existe pas déjà ────────────────────────────
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' });
  }

  // ── 4. Vérifier que le cluster existe bien en BDD ─────────────────────────
  const clusterInDb = await prisma.cluster.findUnique({ where: { id: clusterId } });
  if (!clusterInDb || !clusterInDb.active) {
    return res.status(400).json({ error: 'Ce cluster n\'est pas disponible actuellement.' });
  }

  // ── 5. Vérifier le code parrainage (optionnel) ────────────────────────────
  let parrain: any = null;
  if (refCode) {
    // Format : CGIF-{INITIALS}-{YEAR} ou identifiant custom
    parrain = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: refCode.replace('CGIF-', '').split('-')[0], mode: 'insensitive' } },
        ],
        status: 'ACTIVE',
      },
    });
    // Si code non reconnu → on continue quand même (pas bloquant)
  }

  // ── 6. Créer le membre ────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(password, 12);
  const initials = name.trim().split(' ')
    .map((w: string) => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 3);

  // Un membre ne peut appartenir qu'à UN SEUL cluster
  // Le champ clusterId est un champ simple String (pas un tableau) → contrainte physique
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      initials,
      country,
      city:           city || null,
      phone:          phone || null,
      clusterId,                        // → 1 seul cluster possible
      domain:         specialization,   // on stocke l'ID de spécialisation dans domain
      specialization,                   // champ dédié (à ajouter au schema)
      role:           'MEMBER',
      status:         'PENDING',        // admin doit valider
      kycStatus:      'NONE',
    },
    include: { cluster: { select: { name: true, code: true } } },
  });

  // ── 7. Créer le dossier KYC vide ──────────────────────────────────────────
  await prisma.kycRecord.create({
    data: { memberId: user.id, status: 'NONE' },
  });

  // ── 8. Enregistrer le parrainage ──────────────────────────────────────────
  if (parrain) {
    try {
      await prisma.parrainage.create({
        data: {
          parrainId:  parrain.id,
          filleulId:  user.id,
          status:     'pending',
          points:     0, // crédités quand le filleul devient ACTIVE
        },
      });
    } catch { /* parrainage optionnel, ne bloque pas */ }
  }

  // ── 9. Notification admin ─────────────────────────────────────────────────
  await prisma.notification.create({
    data: {
      userId:  user.id,
      title:   'Demande d\'inscription reçue',
      message: `Bienvenue ${name} ! Votre demande dans le cluster "${getClusterName(clusterId)}" (${getSpecName(clusterId, specialization)}) est en cours d'examen. Vous recevrez une confirmation sous 48h.`,
      type:    'info',
      icon:    '🎉',
    },
  });

  // ── 10. Log audit ─────────────────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      action:    'MEMBER_REGISTERED',
      actorId:   user.id,
      actorRole: 'MEMBER',
      target:    email,
      detail:    `Cluster: ${getClusterName(clusterId)} | Spé: ${getSpecName(clusterId, specialization)} | Pays: ${country}`,
      type:      'member',
      severity:  'info',
    },
  });

  return res.status(201).json({
    message:  'Inscription soumise avec succès. L\'équipe CGIF vous contactera sous 48h.',
    userId:   user.id,
    cluster:  user.cluster?.name,
    status:   'PENDING',
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /auth/login
// ══════════════════════════════════════════════════════════════════════════════
router.post('/login', [
  body('email')    .isEmail().normalizeEmail(),
  body('password') .isLength({ min: 1 }),
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ error: 'Email ou mot de passe invalide' });

  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { cluster: { select: { id: true, name: true, code: true } } },
  });

  if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });
  if (user.status === 'BANNED') return res.status(403).json({ error: 'Compte suspendu. Contactez l\'équipe CGIF.' });
  if (user.status === 'PENDING') return res.status(403).json({ error: 'Votre compte est en cours de validation. Vous recevrez un email de confirmation.' });
  if (user.status === 'SUSPENDED') return res.status(403).json({ error: 'Votre compte est temporairement suspendu.' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });

  const { accessToken, refreshToken } = makeTokens(user.id, user.role);

  // Mettre à jour lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      action:    'LOGIN',
      actorId:   user.id,
      actorRole: user.role,
      target:    email,
      detail:    `Connexion réussie depuis ${req.headers['x-forwarded-for'] || 'IP inconnue'}`,
      type:      'member',
      severity:  'info',
    },
  });

  const { passwordHash: _, ...safeUser } = user as any;

  return res.json({
    accessToken,
    refreshToken,
    user: {
      ...safeUser,
      cluster: user.cluster,
      specialization: user.specialization,
    },
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /auth/refresh
// ══════════════════════════════════════════════════════════════════════════════
router.post('/refresh', async (req: any, res: any) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Token manquant' });

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { cluster: { select: { id: true, name: true, code: true } } },
    });
    if (!user || user.status !== 'ACTIVE') return res.status(401).json({ error: 'Session invalide' });

    const tokens = makeTokens(user.id, user.role);
    const { passwordHash: _, ...safeUser } = user as any;

    return res.json({ ...tokens, user: safeUser });
  } catch {
    return res.status(401).json({ error: 'Token expiré ou invalide' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /auth/me — profil complet de l'utilisateur connecté
// ══════════════════════════════════════════════════════════════════════════════
router.get('/me', authenticate, async (req: AuthRequest, res: any) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      cluster:   { select: { id: true, name: true, code: true, domain: true } },
      kycRecord: { select: { status: true } },
    },
  });
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  const { passwordHash: _, ...safeUser } = user as any;
  return res.json({
    ...safeUser,
    kycStatus: user.kycRecord?.status ?? 'NONE',
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /auth/logout
// ══════════════════════════════════════════════════════════════════════════════
router.post('/logout', authenticate, async (req: AuthRequest, res: any) => {
  await prisma.auditLog.create({
    data: {
      action:    'LOGOUT',
      actorId:   req.user!.id,
      actorRole: req.user!.role,
      target:    req.user!.email,
      detail:    'Déconnexion',
      type:      'member',
      severity:  'info',
    },
  });
  return res.json({ message: 'Déconnecté' });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /auth/clusters — liste publique des clusters pour l'inscription
// ══════════════════════════════════════════════════════════════════════════════
router.get('/clusters', async (_req: any, res: any) => {
  const clusters = await prisma.cluster.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, code: true, domain: true, description: true },
  });
  return res.json(clusters);
});

export default router;
