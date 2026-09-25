const HN_BASE = 'https://news.ycombinator.com/';

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, code) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return String.fromCodePoint(n);
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

export function frontPageUrl(day) {
  return `${HN_BASE}front?day=${day}`;
}

export function itemUrl(id) {
  return `${HN_BASE}item?id=${id}`;
}

export function parseFrontPage(html) {
  const chunks = html.split(/<tr class="athing[^"]*" id="/).slice(1);
  return chunks.map((chunk) => {
    const id = chunk.match(/^(\d+)"/)[1];
    const link = chunk.match(/<span class="titleline">[^<]*<a href="([^"]*)"[^>]*>(.*?)<\/a>/);
    const site = chunk.match(/<span class="sitestr">(.*?)<\/span>/);
    const score = chunk.match(/<span class="score"[^>]*>(\d+) points?<\/span>/);
    const comments = chunk.match(/>(\d+)&nbsp;comments?<\/a>/);
    return {
      id,
      title: decodeEntities(link[2]),
      url: new URL(decodeEntities(link[1]), HN_BASE).href,
      site: site ? decodeEntities(site[1]) : null,
      points: score ? Number(score[1]) : null,
      comments: comments ? Number(comments[1]) : 0,
      discussionUrl: itemUrl(id),
    };
  });
}

export async function fetchFrontPage(day) {
  const res = await fetch(frontPageUrl(day), {
    headers: { 'User-Agent': 'hn-discord-bot' },
  });
  if (!res.ok) throw new Error(`HN returned ${res.status} for ${day}`);
  return parseFrontPage(await res.text());
}
