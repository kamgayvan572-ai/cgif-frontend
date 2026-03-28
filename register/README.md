# CGIF — Inscription complète avec validation cluster

## Fichiers à déployer

### BACKEND (repo cgif-backend)

| Fichier source | Destination |
|---|---|
| backend/clusters-validation.ts | src/data/clusters-validation.ts |
| backend/auth.ts | src/routes/auth.ts |
| backend/seed.ts | prisma/seed.ts |

### FRONTEND (repo cgif-frontend)

| Fichier source | Destination |
|---|---|
| frontend/src/data/clusters.ts | src/data/clusters.ts |
| frontend/src/pages/RegisterPage.tsx | src/pages/RegisterPage.tsx |

## Procédure backend

```bash
# 1. Ajouter dans prisma/schema.prisma (modèle User) :
specialization  String?

# 2. Ajouter dans prisma/schema.prisma (modèle Cluster) :
code    String?
domain  String?

# 3. Appliquer le schema
npx prisma db push --accept-data-loss

# 4. Relancer le seed
npx tsx prisma/seed.ts

# 5. Push GitHub
git add .
git commit -m "feat: 15 real clusters + secure register with specialization validation"
git push
```

## Procédure frontend

```bash
git add src/data/clusters.ts src/pages/RegisterPage.tsx
git commit -m "feat: register page with 15 clusters cascade UI"
git push
```

## Garanties métier

| Règle | Mécanisme |
|---|---|
| 1 seul cluster par membre | clusterId = champ String (pas tableau) dans Prisma |
| Spécialisation obligatoirement liée au cluster | Validation serveur dans auth.ts via isValidSpecialization() |
| Cluster inexistant rejeté | Vérification en BDD + dans la liste statique |
| Email unique | Prisma unique constraint |
| Inscription en attente de validation | status: PENDING → admin valide via AdminMembersPage |
| Audit complet | Chaque inscription loggée dans AuditLog |
