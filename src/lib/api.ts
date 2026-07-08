export type AgencyRole = 'OWNER' | 'EDITOR' | 'VIEWER';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED';

export type Agency = {
  id: string;
  name: string;
  notionDatabaseId?: string | null;
  notionWorkspaceName?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CurrentAgency = {
  membershipId: string;
  role: AgencyRole;
  agency: Agency;
};

export type AgencyMember = {
  membershipId: string;
  role: AgencyRole;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    displayName?: string | null;
  };
};

export type AgencyInvitation = {
  id: string;
  email: string;
  role: AgencyRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
};

export type CreatedInvitation = AgencyInvitation & {
  token: string;
};

export type AgencyMembersResponse = {
  members: AgencyMember[];
  invitations: AgencyInvitation[];
};

export type PublicUser = {
  id: string;
  email: string;
  displayName?: string | null;
  memberships?: Array<{
    id: string;
    role: AgencyRole;
    agency: {
      id: string;
      name: string;
    };
  }>;
};

export type AuthSession = {
  token: string;
  user: PublicUser;
};

export type AiUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type AiProviderStatus = {
  id: string;
  label: string;
  configured: boolean;
  defaultModel: string;
  missingConfig?: string[];
};

export type AiProvidersResponse = {
  defaultProvider: string;
  providers: AiProviderStatus[];
};

export type AiCompletionResult = {
  provider: string;
  model: string;
  content: string;
  usage?: AiUsage;
};

export type GenerateTextInput = {
  prompt: string;
  context?: string;
  systemPrompt?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ??
  'http://localhost:3001/api';

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body,
    headers,
    credentials: 'include',
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || response.statusText;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export function register(input: {
  email: string;
  password: string;
  displayName?: string;
}) {
  return apiRequest<AuthSession>('/auth/register', {
    method: 'POST',
    body: input,
  });
}

export function login(input: { email: string; password: string }) {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: input,
  });
}

export function logout() {
  return apiRequest<{ success: true }>('/auth/logout', {
    method: 'POST',
  });
}

export function getProfile() {
  return apiRequest<PublicUser>('/auth/me');
}

export function getAiProviders() {
  return apiRequest<AiProvidersResponse>('/ai/providers');
}

export function generateText(input: GenerateTextInput) {
  return apiRequest<AiCompletionResult>('/ai/generate', {
    method: 'POST',
    body: input,
  });
}

export function getCurrentAgency() {
  return apiRequest<CurrentAgency>('/agencies/current');
}

export function createAgency(input: {
  name: string;
  notionDatabaseId?: string;
  notionWorkspaceName?: string;
}) {
  return apiRequest<{ agency: Agency; membership: { membershipId: string; role: AgencyRole } }>(
    '/agencies',
    {
      method: 'POST',
      body: input,
    },
  );
}

export function updateAgency(
  agencyId: string,
  input: {
    name?: string;
    notionDatabaseId?: string;
    notionWorkspaceName?: string;
  },
) {
  return apiRequest<Agency>(`/agencies/${agencyId}`, {
    method: 'PATCH',
    body: input,
  });
}

export function getAgencyMembers(agencyId: string) {
  return apiRequest<AgencyMembersResponse>(`/agencies/${agencyId}/members`);
}

export function inviteAgencyMember(input: {
  agencyId: string;
  email: string;
  role: AgencyRole;
}) {
  return apiRequest<CreatedInvitation>('/agencies/invitations', {
    method: 'POST',
    body: input,
  });
}

export function acceptInvitation(token: string) {
  return apiRequest<AgencyInvitation>(`/agencies/invitations/${token}/accept`, {
    method: 'POST',
  });
}

export function updateMemberRole(membershipId: string, role: AgencyRole) {
  return apiRequest<AgencyMember>(`/members/${membershipId}/role`, {
    method: 'PATCH',
    body: { role },
  });
}
