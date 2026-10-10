import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

// Reads everything saved through the admin panel at build time.
export const reader = createReader(process.cwd(), config);

type WithPublish = { publish?: boolean; order?: number | null };

async function published<T extends WithPublish>(
  items: Promise<{ slug: string; entry: T }[]>
) {
  return (await items)
    .filter((i) => i.entry.publish !== false)
    .sort((a, b) => (a.entry.order ?? 99) - (b.entry.order ?? 99));
}

export const getSettings = async () => (await reader.singletons.settings.read())!;
export const getImpact = async () => (await reader.singletons.impact.read())?.items ?? [];
export const getHome = async () => (await reader.singletons.home.read())!;
export const getAbout = async () => (await reader.singletons.about.read())!;
export const getChallenge = async () => (await reader.singletons.challenge.read())!;
export const getGithubSettings = async () => (await reader.singletons.github.read())!;

export const getRoles = () => published(reader.collections.roles.all());
export const getProgrammes = () => published(reader.collections.programmes.all());
export const getCommunities = () => published(reader.collections.communities.all());
export const getProjects = () => published(reader.collections.projects.all());
export const getManualPublications = () => published(reader.collections.publications.all());
export const getOngoingResearch = () => published(reader.collections.research.all());
export const getFeatured = async () =>
  (await published(reader.collections.featured.all())).sort((a, b) =>
    (b.entry.date ?? '').localeCompare(a.entry.date ?? '')
  );
export const getTalks = async () =>
  (await published(reader.collections.talks.all())).sort((a, b) =>
    (b.entry.date ?? '').localeCompare(a.entry.date ?? '')
  );

/** Split multiline admin text into paragraphs. */
export const paragraphs = (text?: string | null) =>
  (text ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/** Challenge progress, computed from the start date. */
export function challengeProgress(startDate: string | null | undefined, target: number) {
  if (!startDate) return { started: false, day: 0, target, done: false };
  const start = Date.parse(startDate + 'T00:00:00+05:00');
  const day = Math.floor((Date.now() - start) / 86_400_000) + 1;
  return { started: true, day: Math.max(0, Math.min(day, target)), target, done: day >= target };
}

export const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Karachi' })
    : '';
