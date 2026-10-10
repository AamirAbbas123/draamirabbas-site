import { XMLParser } from 'fast-xml-parser';

// Automatic feeds, fetched when the site builds (on every admin save and daily).
// Each one fails quietly: if a service is down, that section simply shows the
// items you pinned in the admin panel instead of breaking the build.

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const arr = <T>(x: T | T[] | undefined): T[] => (x == null ? [] : Array.isArray(x) ? x : [x]);
const text = (x: any): string => (typeof x === 'object' && x !== null ? x['#text'] ?? '' : String(x ?? ''));

async function get(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'draamirabbas-site-build', ...headers },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

const cache = new Map<string, Promise<any>>();
function once<T>(key: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!cache.has(key)) {
    cache.set(
      key,
      fn().catch((e) => {
        console.warn(`[feeds] ${key} unavailable: ${e.message}`);
        return fallback;
      })
    );
  }
  return cache.get(key)!;
}

export type Post = { title: string; url: string; date: string; summary: string; image?: string };
export type Video = { id: string; title: string; url: string; date: string; thumbnail: string };
export type Publication = { title: string; journal: string; year: number | null; doi?: string; url?: string };
export type Repo = { name: string; description: string; url: string; language: string; stars: number; updated: string };

const strip = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export function getSubstackPosts(feedUrl?: string | null, limit = 12): Promise<Post[]> {
  if (!feedUrl) return Promise.resolve([]);
  return once(`substack:${feedUrl}`, async () => {
    const xml = await (await get(feedUrl)).text();
    const items = arr(parser.parse(xml)?.rss?.channel?.item);
    return items.slice(0, limit).map((i: any) => ({
      title: text(i.title),
      url: text(i.link),
      date: new Date(text(i.pubDate)).toISOString(),
      summary: strip(text(i.description)).slice(0, 220),
      image: i.enclosure?.['@_url'],
    }));
  }, []);
}

export function getYoutubeVideos(channelId?: string | null, limit = 12): Promise<Video[]> {
  if (!channelId) return Promise.resolve([]);
  return once(`youtube:${channelId}`, async () => {
    const xml = await (await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId.trim()}`)).text();
    const entries = arr(parser.parse(xml)?.feed?.entry);
    return entries.slice(0, limit).map((e: any) => {
      const id = text(e['yt:videoId']);
      return {
        id,
        title: text(e.title),
        url: `https://www.youtube.com/watch?v=${id}`,
        date: text(e.published),
        thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
      };
    });
  }, []);
}

export function getOrcidWorks(orcidId?: string | null): Promise<Publication[]> {
  if (!orcidId) return Promise.resolve([]);
  return once(`orcid:${orcidId}`, async () => {
    const data = await (await get(`https://pub.orcid.org/v3.0/${orcidId.trim()}/works`, { Accept: 'application/json' })).json();
    return arr(data?.group).map((g: any) => {
      const w = g['work-summary']?.[0] ?? {};
      const ids = arr(w['external-ids']?.['external-id']);
      const doi = ids.find((x: any) => x['external-id-type'] === 'doi')?.['external-id-value'];
      return {
        title: w.title?.title?.value ?? 'Untitled',
        journal: w['journal-title']?.value ?? '',
        year: w['publication-date']?.year?.value ? Number(w['publication-date'].year.value) : null,
        doi,
        url: w.url?.value,
      };
    });
  }, []);
}

export function getGithubRepos(username?: string | null): Promise<Repo[]> {
  if (!username) return Promise.resolve([]);
  return once(`github:${username}`, async () => {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const repos = await (await get(`https://api.github.com/users/${username.trim()}/repos?sort=updated&per_page=50`, headers)).json();
    return arr(repos)
      .filter((r: any) => !r.fork && !r.archived)
      .map((r: any) => ({
        name: r.name,
        description: r.description ?? '',
        url: r.html_url,
        language: r.language ?? '',
        stars: r.stargazers_count ?? 0,
        updated: r.pushed_at,
      }));
  }, []);
}
