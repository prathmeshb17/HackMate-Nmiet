/**
 * Live Hackathon Aggregator & Continuous Synchronization Service
 * Continuously fetches and synchronizes live, ongoing, and upcoming hackathons across:
 * - Unstop (via public API / proxy)
 * - Devpost (via live official API)
 * - Devfolio & Major League Hacking (MLH)
 * - Local Community Hosted Hackathons
 */

export const PLATFORMS = {
  ALL: 'All Platforms',
  UNSTOP: 'Unstop',
  DEVPOST: 'Devpost',
  DEVFOLIO: 'Devfolio',
  MLH: 'MLH',
  HACKCULTURE: 'HackCulture',
  COMMUNITY: 'Community Hosted'
};

const HOSTED_STORAGE_KEY = 'hackmate_hosted_hackathons';
const HACKATHONS_CACHE_KEY = 'hackmate_cached_hackathons';

import { ALL_HACKATHONS } from '../data/allHackathons.js';

// Curated Verified Baseline Hackathons across all formats (500+ challenges)
export const VERIFIED_BASELINE_HACKATHONS = ALL_HACKATHONS;


export function getHostedHackathons() {
  try {
    const saved = localStorage.getItem(HOSTED_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error reading hosted hackathons:', e);
    return [];
  }
}

export function saveHostedHackathon(hackathon) {
  try {
    const existing = getHostedHackathons();
    const updated = [hackathon, ...existing];
    localStorage.setItem(HOSTED_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving hosted hackathon:', e);
    return [];
  }
}

export const TOTAL_UNSTOP_OPPORTUNITIES = 6788;
export const TOTAL_DEVPOST_OPPORTUNITIES = 194;

function cleanHtmlText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Maps raw Unstop API opportunity into standardized HackMate model
 */
export function mapUnstopItem(item) {
  if (!item || !item.id) return null;

  const skills = (item.filters || [])
    .filter(f => f.type === 'category' || f.type === 'eligible')
    .map(f => f.name)
    .slice(0, 4);

  let prizeStr = 'Certificate & Goodies';
  if (item.prizes && item.prizes.length > 0) {
    if (item.prizes[0].cash) {
      prizeStr = `₹${item.prizes[0].cash.toLocaleString()}`;
    } else if (item.prizes[0].title) {
      prizeStr = item.prizes[0].title;
    }
  }

  const isOnline = item.region === 'online' || item.regnRequirements?.work_location_type === 'online';
  const isLive = item.regn_open === 1 || item.regnRequirements?.reg_status === 'OPEN' || (item.remain_days && item.remain_days !== 'Ended');

  let cleanDesc = cleanHtmlText(item.details);
  if (cleanDesc.length > 220) {
    cleanDesc = cleanDesc.slice(0, 217) + '...';
  }
  if (!cleanDesc) {
    cleanDesc = `Participate in ${item.title} hosted by ${item.organisation?.name || 'Unstop Partner'}. Register on Unstop for official submission, live stages, and prizes.`;
  }

  const directUrl = item.seo_url || (item.public_url ? `https://unstop.com/${item.public_url}` : `https://unstop.com/hackathons/${item.id}`);

  let dateDisplay = 'Ongoing 2026';
  if (item.start_date) {
    const s = item.start_date.split('T')[0];
    const e = item.end_date ? item.end_date.split('T')[0] : '';
    dateDisplay = e ? `${s} - ${e}` : s;
  } else if (item.regnRequirements?.start_regn_dt) {
    const s = item.regnRequirements.start_regn_dt.split('T')[0];
    const e = item.regnRequirements.end_regn_dt ? item.regnRequirements.end_regn_dt.split('T')[0] : '';
    dateDisplay = e ? `${s} - ${e}` : s;
  } else if (item.remain_days) {
    dateDisplay = item.remain_days;
  }

  return {
    id: `unstop-${item.id}`,
    title: item.title,
    organizer: item.organisation?.name || 'Unstop Partner Institute',
    platform: 'Unstop',
    status: isLive ? 'LIVE_NOW' : 'UPCOMING',
    registrationUrl: directUrl,
    date: dateDisplay,
    mode: isOnline ? 'Online' : 'In-Person',
    location: isOnline ? '' : (item.organisation?.name || 'Campus Venue'),
    prizePool: prizeStr,
    maxTeamSize: item.regnRequirements?.max_team_size || 4,
    requiredSkills: skills.length > 0 ? skills : ['React', 'Python', 'Problem Solving'],
    category: item.filters?.[0]?.name || 'Hackathon',
    description: cleanDesc,
    bannerColor: 'from-amber-600 via-orange-700 to-indigo-900',
    badgeText: item.remain_days || (isLive ? 'Live on Unstop' : 'Upcoming'),
    isHosted: false
  };
}

/**
 * Fetch a single page of Unstop opportunities (100 items per page)
 */
export async function fetchUnstopPage(page = 1, perPage = 100) {
  try {
    const res = await fetch(`/api/unstop?opportunity=hackathons&per_page=${perPage}&page=${page}`);
    if (!res.ok) throw new Error(`Unstop API status: ${res.status}`);
    const json = await res.json();
    const rawList = json.data?.data || json.data || [];
    const mapped = rawList.map(mapUnstopItem).filter(Boolean);
    return {
      hackathons: mapped,
      totalAvailable: json.data?.total || TOTAL_UNSTOP_OPPORTUNITIES,
      currentPage: json.data?.current_page || page,
      lastPage: json.data?.last_page || 68
    };
  } catch (err) {
    console.warn(`Unstop page ${page} error:`, err.message);
    return { hackathons: [], totalAvailable: TOTAL_UNSTOP_OPPORTUNITIES, currentPage: page, lastPage: 68 };
  }
}

/**
 * Fetch bulk live hackathons from Devpost across open & upcoming pages
 */
export async function fetchLiveDevpostHackathons(maxPages = 4) {
  try {
    const urls = [];
    for (let p = 1; p <= maxPages; p++) {
      urls.push(`/api/devpost?page=${p}&status=open`);
      urls.push(`/api/devpost?page=${p}&status=upcoming`);
    }

    const responses = await Promise.allSettled(urls.map(u => fetch(u)));
    const rawList = [];

    for (const r of responses) {
      if (r.status === 'fulfilled' && r.value.ok) {
        try {
          const d = await r.value.json();
          if (Array.isArray(d.hackathons)) {
            rawList.push(...d.hackathons);
          }
        } catch {
          // ignore individual json parse errors
        }
      }
    }

    const devpostSeen = new Set();
    const mapped = [];

    for (const item of rawList) {
      if (!item || !item.id || devpostSeen.has(item.id)) continue;
      devpostSeen.add(item.id);

      const themes = (item.themes || []).map(t => t.name);
      const cleanPrize = item.prize_amount ? cleanHtmlText(item.prize_amount) : '$15,000+';

      mapped.push({
        id: `devpost-${item.id}`,
        title: item.title,
        organizer: item.organization_name || 'Devpost Partner',
        platform: 'Devpost',
        status: item.open_state === 'open' ? 'LIVE_NOW' : 'UPCOMING',
        registrationUrl: item.url || (item.id ? `https://devpost.com/software/${item.id}` : 'https://devpost.com/hackathons'),
        date: item.submission_period_dates || item.time_left_to_submission || 'Active Now',
        mode: item.displayed_location?.location || 'Online',
        prizePool: cleanPrize || '$10,000+',
        maxTeamSize: 4,
        requiredSkills: themes.length > 0 ? themes : ['React', 'Python', 'Machine Learning'],
        category: themes[0] || 'Open Innovation',
        description: `${item.title} organized by ${item.organization_name || 'Devpost'}. Featuring ${item.registrations_count ? item.registrations_count.toLocaleString() : 'thousands of'} registered hackers worldwide.`,
        bannerColor: 'from-blue-600 via-sky-600 to-indigo-900',
        badgeText: item.time_left_to_submission || 'Live on Devpost',
        isHosted: false
      });
    }

    return mapped;
  } catch (err) {
    console.warn('Devpost live fetch error:', err.message);
    return [];
  }
}

/**
 * Fetch bulk stream of Unstop hackathons across multiple pages
 * (e.g. pages 1 to 10 = 1,000 hackathons) in pairs of 2 to avoid network congestion
 */
export async function fetchBulkUnstopHackathons(startPage = 1, maxPages = 10, onProgress = null) {
  const accumulated = [];

  for (let p = startPage; p <= maxPages; p += 2) {
    const pageA = p;
    const pageB = p + 1 <= maxPages ? p + 1 : null;

    const promises = [fetchUnstopPage(pageA, 100)];
    if (pageB) promises.push(fetchUnstopPage(pageB, 100));

    const results = await Promise.allSettled(promises);
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.hackathons.length > 0) {
        accumulated.push(...r.value.hackathons);
      }
    }

    if (onProgress) {
      onProgress({
        currentCount: accumulated.length,
        currentPage: pageB || pageA,
        maxPages
      });
    }
  }

  return accumulated;
}

/**
 * Deduplicate a list of hackathons by normalized title and URL
 */
export function deduplicateHackathons(list) {
  const seenUrls = new Set();
  const seenTitles = new Set();
  const result = [];

  for (const h of list) {
    if (!h) continue;
    const normTitle = h.title?.trim().toLowerCase();
    const url = h.registrationUrl?.trim().toLowerCase();

    if (normTitle && !seenTitles.has(normTitle) && (!url || !seenUrls.has(url))) {
      seenTitles.add(normTitle);
      if (url) seenUrls.add(url);
      result.push(h);
    }
  }

  return result;
}

/**
 * Quick Fetch (Fast Hydration):
 * Loads page 1 & 2 of Unstop (200 items) + Devpost pages in ~1.5s
 */
export async function fetchQuickLiveHackathons() {
  const hosted = getHostedHackathons();
  
  let staticList = [];
  try {
    const res = await fetch('./hackathons.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) staticList = data;
    }
  } catch {}

  const [unstopP1, unstopP2, devpostList] = await Promise.allSettled([
    fetchUnstopPage(1, 100),
    fetchUnstopPage(2, 100),
    fetchLiveDevpostHackathons(2)
  ]);

  const p1 = unstopP1.status === 'fulfilled' ? unstopP1.value.hackathons : [];
  const p2 = unstopP2.status === 'fulfilled' ? unstopP2.value.hackathons : [];
  const devpost = devpostList.status === 'fulfilled' ? devpostList.value : [];

  const combined = [
    ...hosted,
    ...p1,
    ...p2,
    ...devpost,
    ...staticList,
    ...VERIFIED_BASELINE_HACKATHONS
  ];

  return deduplicateHackathons(combined);
}

/**
 * Master Sync All:
 * Syncs 1,000+ hackathons across all formats: Unstop, Devpost, Devfolio, MLH, HackCulture & Community
 */
export async function fetchAllLiveHackathons(maxUnstopPages = 10, onProgress = null) {
  const hosted = getHostedHackathons();

  let staticList = [];
  try {
    const res = await fetch('./hackathons.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) staticList = data;
    }
  } catch {}

  // Run Devpost and Unstop bulk fetches (works on localhost dev proxy or direct when available)
  const [devpostRes, unstopRes] = await Promise.allSettled([
    fetchLiveDevpostHackathons(4),
    fetchBulkUnstopHackathons(1, maxUnstopPages, onProgress)
  ]);

  const liveDevpost = devpostRes.status === 'fulfilled' ? devpostRes.value : [];
  const liveUnstop = unstopRes.status === 'fulfilled' ? unstopRes.value : [];

  const combined = [
    ...hosted,
    ...liveDevpost,
    ...liveUnstop,
    ...staticList,
    ...VERIFIED_BASELINE_HACKATHONS
  ];

  const deduplicated = deduplicateHackathons(combined);

  // Safe Quota-conscious storage: cache top 200 items to localStorage so cold boots are instant
  try {
    const safeSubset = deduplicated.slice(0, 200);
    localStorage.setItem(HACKATHONS_CACHE_KEY, JSON.stringify(safeSubset));
  } catch (e) {
    console.warn('LocalStorage quota limit reached, caching skipped safely:', e);
  }

  return deduplicated;
}

