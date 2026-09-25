const HN_BASE = 'https://news.ycombinator.com/';
const SEARCH_API = 'https://hn.algolia.com/api/v1/search';
const DAY_SECONDS = 24 * 60 * 60;

export function itemUrl(id) {
  return `${HN_BASE}item?id=${id}`;
}

export function weekRange(weekStart) {
  const start = Date.parse(`${weekStart}T00:00:00Z`) / 1000;
  return { start, end: start + 7 * DAY_SECONDS };
}

export function searchUrl(weekStart, count) {
  const { start, end } = weekRange(weekStart);
  const params = new URLSearchParams({
    tags: 'story',
    numericFilters: `created_at_i>=${start},created_at_i<${end}`,
    hitsPerPage: String(count),
  });
  return `${SEARCH_API}?${params}`;
}

export function browseUrl(weekStart) {
  const { start, end } = weekRange(weekStart);
  const params = new URLSearchParams({
    dateRange: 'custom',
    dateStart: String(start),
    dateEnd: String(end),
    sort: 'byPopularity',
    type: 'story',
  });
  return `https://hn.algolia.com/?${params}`;
}

export function parseHits(hits) {
  return hits.map((hit) => {
    const discussionUrl = itemUrl(hit.objectID);
    return {
      id: hit.objectID,
      title: hit.title,
      url: hit.url || discussionUrl,
      site: hit.url ? new URL(hit.url).hostname.replace(/^www\./, '') : null,
      points: hit.points ?? null,
      comments: hit.num_comments ?? 0,
      discussionUrl,
    };
  });
}

export async function fetchTopStories(weekStart, count, { retries = 3, delayMs = 30_000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(searchUrl(weekStart, count));
    if (res.ok) return parseHits((await res.json()).hits);
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= retries) {
      throw new Error(`HN search returned ${res.status} for week of ${weekStart}`);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs * 2 ** attempt));
  }
}
