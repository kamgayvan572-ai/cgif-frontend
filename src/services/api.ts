import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../context/auth.store';

// ── Types ─────────────────────────────────────────────────────
export type ProjectStatus = 'PENDING' | 'REVIEW' | 'VOTING' | 'FUNDING' | 'FUNDED' | 'DONE' | 'REJECTED';
export type KycStatus = 'NONE' | 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
export type InvestmentStatus = 'VOEU_SOUMIS' | 'COORDOS_ENVOYEES' | 'VIREMENT_EN_ATTENTE' | 'VIREMENT_RECU' | 'ACTIVE' | 'ANNULE';

export interface Project {
  id: string; title: string; description?: string;
  status: ProjectStatus; targetAmount: number; sharePrice: number;
  collectedAmount: number; progress: number;
  cluster?: { id: string; name: string };
  fundingDeadline?: string; createdAt: string;
  _count?: { investments: number; documents: number };
}

export interface Investment {
  id: string; memberId: string; projectId: string;
  amount: number; sharesCount: number; sharePrice: number;
  status: InvestmentStatus; refVirement?: string;
  paymentMethod: string; submittedAt: string;
  member?: { name: string; email: string; country: string };
  project?: { title: string };
}

export interface KycRecord {
  id: string; memberId: string; status: KycStatus;
  nom: string; prenom: string; dateNaissance: string;
  nationalite: string; adresse: string;
  docType?: string; proofType?: string;
  submittedAt: string; reviewedAt?: string;
  rejectionReason?: string;
  member?: { name: string; email: string; country: string; initials: string };
}

// ── CLUSTERS ─────────────────────────────────────────────────
export const useClusters = () =>
  useQuery({ queryKey: ['clusters'], queryFn: () => api.get('/clusters').then(r => r.data) });

// ── PROJECTS ─────────────────────────────────────────────────
export const useProjects = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['projects', params],
    queryFn: () => api.get('/projects', { params }).then(r => r.data),
  });

export const useProject = (id: string) =>
  useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.get(`/projects/${id}`).then(r => r.data),
    enabled: !!id,
  });

export const useUpdateProjectStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, analystId }: { id: string; status: ProjectStatus; analystId?: string }) =>
      api.patch(`/projects/${id}/status`, { status, analystId }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useSubmitInvestment = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) =>
      api.post(`/projects/${projectId}/invest`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investments'] });
      qc.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
};

// ── INVESTMENTS ───────────────────────────────────────────────
export const useInvestments = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['investments', params],
    queryFn: () => api.get('/investments', { params }).then(r => r.data),
  });

export const useMyInvestments = () =>
  useQuery({
    queryKey: ['investments', 'me'],
    queryFn: () => api.get('/investments/me').then(r => r.data),
  });

export const useSendBankInfo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/investments/${id}/send-bank-info`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investments'] }),
  });
};

export const useConfirmVirement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.patch(`/investments/${id}/confirm`, { notes }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investments'] }),
  });
};

export const useActivateParts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/investments/${id}/activate`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investments'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// ── KYC ──────────────────────────────────────────────────────
export const useMyKyc = () =>
  useQuery({ queryKey: ['kyc', 'me'], queryFn: () => api.get('/kyc/me').then(r => r.data) });

export const useSubmitKyc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.post('/kyc/submit', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kyc'] });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useAdminKycList = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['kyc', 'admin', params],
    queryFn: () => api.get('/kyc', { params }).then(r => r.data),
  });

export const useApproveKyc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.patch(`/kyc/${id}/approve`, { notes }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kyc'] }),
  });
};

export const useRejectKyc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/kyc/${id}/reject`, { reason }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kyc'] }),
  });
};

// ── MEMBERS ───────────────────────────────────────────────────
export const useMembers = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['members', params],
    queryFn: () => api.get('/users', { params }).then(r => r.data),
  });

export const useUpdateMemberStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/users/${id}/status`, { status }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
};

// ── POSTS ─────────────────────────────────────────────────────
export const usePosts = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['posts', params],
    queryFn: () => api.get('/posts', { params }).then(r => r.data),
  });

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.post('/posts', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};

// ── EVENTS ────────────────────────────────────────────────────
export const useEvents = () =>
  useQuery({ queryKey: ['events'], queryFn: () => api.get('/events').then(r => r.data) });

export const useRegisterEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/events/${id}/register`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
};

export const useUnregisterEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/events/${id}/register`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
};

// ── NOTIFICATIONS ────────────────────────────────────────────
export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 30_000, // polling 30s
  });

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all').then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

// ── MESSAGES ─────────────────────────────────────────────────
export const useMessages = () =>
  useQuery({ queryKey: ['messages'], queryFn: () => api.get('/messages/inbox').then(r => r.data) });

// ── NEWS ─────────────────────────────────────────────────────
export const useNews = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['news', params],
    queryFn: () => api.get('/news', { params }).then(r => r.data),
  });

// ── ANALYTICS ────────────────────────────────────────────────
export const useAnalytics = () =>
  useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
    refetchInterval: 60_000,
  });

// ── AUDIT ────────────────────────────────────────────────────
export const useAuditLogs = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['audit', params],
    queryFn: () => api.get('/audit', { params }).then(r => r.data),
  });
