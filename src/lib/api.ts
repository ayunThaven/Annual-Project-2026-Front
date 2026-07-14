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

export type AgencyAiProvider = 'gemini' | 'demo';

export type AgencyAiSettings = {
  provider: AgencyAiProvider;
  model: string;
  geminiApiKeyConfigured: boolean;
  updatedAt?: string | null;
};

export type UpdateAgencyAiSettingsInput = {
  provider?: AgencyAiProvider;
  model?: string;
  geminiApiKey?: string;
  clearGeminiApiKey?: boolean;
};

export type AiCompletionResult = {
  provider: string;
  model: string;
  content: string;
  usage?: AiUsage;
};

export type ContentStatus =
  | 'IDEA'
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'SCHEDULED'
  | 'PUBLISHED';

export type SyncStatus = 'PENDING' | 'SYNCED' | 'ERROR' | 'CONFLICT';

export type ContentItem = {
  id: string;
  title: string;
  status: ContentStatus;
  publicationDate?: string | null;
  channel?: string | null;
  contentType?: string | null;
  url?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  body?: string | null;
  syncStatus?: SyncStatus;
  createdAt: string;
  updatedAt: string;
};

export type ContentIdeaSource = 'MANUAL' | 'SCHEDULED';
export type ContentIdeaStatus = 'NEW' | 'ACCEPTED' | 'DISMISSED';
export type DuplicateStatus = 'UNIQUE' | 'POSSIBLE_DUPLICATE' | 'DUPLICATE';
export type IdeaGenerationCadence = 'DAILY' | 'WEEKLY';
export type IdeaGenerationRunStatus = 'SUCCESS' | 'ERROR';

export type SimilarIdeaItem = {
  id: string;
  type: 'CONTENT' | 'CURATION' | 'IDEA';
  title: string;
  score: number;
};

export type ContentIdea = {
  id: string;
  title: string;
  angle?: string | null;
  contentType?: string | null;
  keywords?: string[] | null;
  searchIntent?: string | null;
  rationale?: string | null;
  duplicateScore: number;
  duplicateStatus: DuplicateStatus;
  similarItems?: SimilarIdeaItem[] | null;
  source: ContentIdeaSource;
  status: ContentIdeaStatus;
  acceptedContent?: ContentItem | null;
  createdAt: string;
  updatedAt: string;
};

export type IdeaGenerationRun = {
  id: string;
  source: ContentIdeaSource;
  status: IdeaGenerationRunStatus;
  generatedCount: number;
  errorMessage?: string | null;
  completedAt?: string | null;
  createdAt: string;
};

export type ContentIdeasResponse = {
  ideas: ContentIdea[];
  run: IdeaGenerationRun;
};

export type GenerateContentIdeasInput = {
  theme: string;
  sector?: string;
  count?: 3 | 5 | 10;
  checkDuplicates?: boolean;
};

export type IdeaGenerationSettings = {
  id: string;
  enabled: boolean;
  cadence: IdeaGenerationCadence;
  timeOfDay: string;
  weekday?: number | null;
  timezone: string;
  theme?: string | null;
  sector?: string | null;
  count: 3 | 5 | 10;
  checkDuplicates: boolean;
  nextRunAt?: string | null;
  lastRunAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateIdeaGenerationSettingsInput = Partial<
  Pick<
    IdeaGenerationSettings,
    | 'enabled'
    | 'cadence'
    | 'timeOfDay'
    | 'weekday'
    | 'timezone'
    | 'theme'
    | 'sector'
    | 'count'
    | 'checkDuplicates'
  >
>;

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

export function getAgencyAiSettings(agencyId: string) {
  return apiRequest<AgencyAiSettings>(`/agencies/${agencyId}/ai/settings`);
}

export function updateAgencyAiSettings(
  agencyId: string,
  input: UpdateAgencyAiSettingsInput,
) {
  return apiRequest<AgencyAiSettings>(`/agencies/${agencyId}/ai/settings`, {
    method: 'PATCH',
    body: input,
  });
}

export function generateText(input: GenerateTextInput) {
  return apiRequest<AiCompletionResult>('/ai/generate', {
    method: 'POST',
    body: input,
  });
}

export function listContentItems(agencyId: string) {
  return apiRequest<ContentItem[]>(`/agencies/${agencyId}/content`);
}

export function createContentItem(
  agencyId: string,
  input: {
    title: string;
    status?: ContentStatus;
    publicationDate?: string;
    channel?: string;
    contentType?: string;
    url?: string;
    tags?: string[];
    notes?: string;
  },
) {
  return apiRequest<ContentItem>(`/agencies/${agencyId}/content`, {
    method: 'POST',
    body: input,
  });
}

export function listContentIdeas(agencyId: string) {
  return apiRequest<ContentIdea[]>(`/agencies/${agencyId}/ideas`);
}

export function generateContentIdeas(
  agencyId: string,
  input: GenerateContentIdeasInput,
) {
  return apiRequest<ContentIdeasResponse>(
    `/agencies/${agencyId}/ideas/generate`,
    {
      method: 'POST',
      body: input,
    },
  );
}

export function updateContentIdea(
  agencyId: string,
  ideaId: string,
  input: { status?: ContentIdeaStatus },
) {
  return apiRequest<ContentIdea>(`/agencies/${agencyId}/ideas/${ideaId}`, {
    method: 'PATCH',
    body: input,
  });
}

export function acceptContentIdea(agencyId: string, ideaId: string) {
  return apiRequest<ContentIdea>(
    `/agencies/${agencyId}/ideas/${ideaId}/accept`,
    {
      method: 'POST',
    },
  );
}

export function getIdeaGenerationSettings(agencyId: string) {
  return apiRequest<IdeaGenerationSettings>(
    `/agencies/${agencyId}/ideas/settings`,
  );
}

export function updateIdeaGenerationSettings(
  agencyId: string,
  input: UpdateIdeaGenerationSettingsInput,
) {
  return apiRequest<IdeaGenerationSettings>(
    `/agencies/${agencyId}/ideas/settings`,
    {
      method: 'PATCH',
      body: input,
    },
  );
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

export type GenerateContentInput = {
  title: string;
  brief?: string;
  contentType?: string;
  channel?: string;
  targetAudience?: string;
  tone?: string;
  language?: string;
  keywords?: string[];
  outline?: string[];
  callToAction?: string;
  constraints?: string;
  saveDraft?: boolean;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export type GenerateContentResponse = {
  content: string;
  item?: ContentItem;
  ai: {
    provider: string;
    model: string;
    usage?: AiUsage;
  };
};

export function generateContent(
  agencyId: string,
  input: GenerateContentInput,
) {
  return apiRequest<GenerateContentResponse>(
    `/agencies/${agencyId}/content/generate`,
    {
      method: 'POST',
      body: input,
    },
  );
}

export type CurationStatus = 'TO_REVIEW' | 'REVIEWED' | 'SHARED';

export type FeedSource = {
  id: string;
  url: string;
  name?: string | null;
  defaultTopics?: string[] | null;
  enabled: boolean;
  lastFetchedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateFeedSourceInput = {
  url: string;
  name?: string;
  defaultTopics?: string[];
};

export type UpdateFeedSourceInput = Partial<CreateFeedSourceInput> & {
  enabled?: boolean;
};

export type IngestionSummary = {
  imported: number;
  skipped: number;
};

export function listFeedSources(agencyId: string) {
  return apiRequest<FeedSource[]>(`/agencies/${agencyId}/curation/feeds`);
}

export function createFeedSource(
  agencyId: string,
  input: CreateFeedSourceInput,
) {
  return apiRequest<FeedSource>(`/agencies/${agencyId}/curation/feeds`, {
    method: 'POST',
    body: input,
  });
}

export function updateFeedSource(
  agencyId: string,
  id: string,
  input: UpdateFeedSourceInput,
) {
  return apiRequest<FeedSource>(`/agencies/${agencyId}/curation/feeds/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export function removeFeedSource(agencyId: string, id: string) {
  return apiRequest<{ success: true }>(
    `/agencies/${agencyId}/curation/feeds/${id}`,
    { method: 'DELETE' },
  );
}

export function ingestFeedSource(agencyId: string, id: string) {
  return apiRequest<IngestionSummary>(
    `/agencies/${agencyId}/curation/feeds/${id}/ingest`,
    { method: 'POST' },
  );
}

export function ingestAllFeedSources(agencyId: string) {
  return apiRequest<IngestionSummary>(
    `/agencies/${agencyId}/curation/feeds/ingest`,
    { method: 'POST' },
  );
}

export type CurationItem = {
  id: string;
  title: string;
  sourceUrl?: string | null;
  source?: string | null;
  topics?: string[] | null;
  status: CurationStatus;
  curatedBy?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCurationItemInput = {
  title: string;
  sourceUrl?: string;
  source?: string;
  topics?: string[];
  status?: CurationStatus;
  curatedBy?: string;
  notes?: string;
};

export type UpdateCurationItemInput = Partial<CreateCurationItemInput>;

export function listCurationItems(agencyId: string) {
  return apiRequest<CurationItem[]>(`/agencies/${agencyId}/curation`);
}

export function createCurationItem(
  agencyId: string,
  input: CreateCurationItemInput,
) {
  return apiRequest<CurationItem>(`/agencies/${agencyId}/curation`, {
    method: 'POST',
    body: input,
  });
}

export function updateCurationItem(
  agencyId: string,
  id: string,
  input: UpdateCurationItemInput,
) {
  return apiRequest<CurationItem>(`/agencies/${agencyId}/curation/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export function removeCurationItem(agencyId: string, id: string) {
  return apiRequest<{ success: true }>(`/agencies/${agencyId}/curation/${id}`, {
    method: 'DELETE',
  });
}
