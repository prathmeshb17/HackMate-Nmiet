/**
 * HackMate Real-Time Hackathon Date & Expiry Inspection Engine
 * Parses, validates, and prunes hackathons based on live dates and deadlines.
 */

const MONTH_NAMES = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11
};

/**
 * Extracts the end Date object from any date string format:
 * - ISO string: "2026-10-30T23:59:39+05:30" or "2026-10-30"
 * - Range: "Oct 16 - 18, 2026", "Aug 31 - Oct 23, 2026", "Jul 16, 2026 - Jan 15, 2027"
 * - Single date: "Oct 24, 2026", "Closes 2026-10-25"
 */
export function parseEndDate(dateStr, defaultYear = 2026) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const str = dateStr.trim();

  // If text explicitly says Ended or Finished
  if (/ended|finished|closed|expired/i.test(str)) {
    return new Date(0); // Epoch = long ago ended
  }

  // 1. Check for ISO Date pattern e.g. 2026-10-30 or 2026-10-30T...
  const isoMatches = str.match(/\b(202\d-\d{2}-\d{2})/g);
  if (isoMatches && isoMatches.length > 0) {
    // End date is always the last ISO date in the string
    const lastIso = isoMatches[isoMatches.length - 1];
    const parsed = new Date(`${lastIso}T23:59:59`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // 2. Check for human date ranges
  // Extract explicit year from string, fallback to defaultYear
  const yearMatches = str.match(/\b(202\d)\b/g);
  const detectedYear = yearMatches && yearMatches.length > 0
    ? parseInt(yearMatches[yearMatches.length - 1], 10)
    : defaultYear;

  // Split range by '-' or 'to'
  const parts = str.split(/\s*[-–—]\s*|\s+to\s+/i);
  const endPart = parts[parts.length - 1].trim();

  // Look for month in endPart, or fallback to first part if endPart is just "18, 2026"
  let monthIdx = -1;
  const lowerEnd = endPart.toLowerCase();
  for (const [key, idx] of Object.entries(MONTH_NAMES)) {
    if (lowerEnd.includes(key)) {
      monthIdx = idx;
      break;
    }
  }

  if (monthIdx === -1 && parts.length > 1) {
    const lowerStart = parts[0].toLowerCase();
    for (const [key, idx] of Object.entries(MONTH_NAMES)) {
      if (lowerStart.includes(key)) {
        monthIdx = idx;
        break;
      }
    }
  }

  // Extract day number (1-31)
  const dayMatch = endPart.match(/\b([1-9]|[12]\d|3[01])\b/);

  if (monthIdx !== -1 && dayMatch) {
    const day = parseInt(dayMatch[1], 10);
    // Determine year: if endPart has an explicit year, use it; else detectedYear
    const partYearMatch = endPart.match(/\b(202\d)\b/);
    const year = partYearMatch ? parseInt(partYearMatch[1], 10) : detectedYear;

    const parsedDate = new Date(year, monthIdx, day, 23, 59, 59);
    if (!isNaN(parsedDate.getTime())) return parsedDate;
  }

  // 3. Fallback standard JavaScript Date parser
  const fallback = new Date(endPart);
  if (!isNaN(fallback.getTime())) {
    fallback.setHours(23, 59, 59, 999);
    return fallback;
  }

  return null;
}

/**
 * Evaluates whether a hackathon is ended, active, or upcoming, and calculates remaining time.
 */
export function evaluateHackathon(hackathon, now = new Date()) {
  if (!hackathon) return { isEnded: true };

  // Explicit status check
  if (
    hackathon.status === 'ENDED' ||
    hackathon.status === 'FINISHED' ||
    /ended|finished|closed/i.test(hackathon.badgeText || '')
  ) {
    return { isEnded: true, status: 'ENDED' };
  }

  const endDate = parseEndDate(hackathon.date || hackathon.end_date);

  // If no date can be parsed, assume not ended unless marked so
  if (!endDate) {
    return {
      isEnded: false,
      status: hackathon.status || 'LIVE_NOW',
      badgeText: hackathon.badgeText || 'Active'
    };
  }

  const nowTime = now.getTime();
  const endTime = endDate.getTime();

  // If end date has passed, it has ended!
  if (endTime < nowTime) {
    return {
      isEnded: true,
      status: 'ENDED',
      endDate
    };
  }

  // Calculate remaining time
  const diffMs = endTime - nowTime;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  let liveBadge = 'Live Now';
  if (diffHours <= 24) {
    liveBadge = '⚡ Closes Today!';
  } else if (diffDays === 1) {
    liveBadge = '⏳ 1 day left';
  } else if (diffDays <= 7) {
    liveBadge = `⏳ ${diffDays} days left`;
  } else if (diffDays <= 30) {
    liveBadge = `📅 ${diffDays} days left`;
  } else {
    const months = Math.round(diffDays / 30);
    liveBadge = `📅 ~${months} mo left`;
  }

  return {
    isEnded: false,
    status: 'LIVE_NOW',
    endDate,
    remainingDays: diffDays,
    badgeText: hackathon.badgeText?.toLowerCase().includes('live') || hackathon.badgeText?.toLowerCase().includes('left')
      ? liveBadge
      : (hackathon.badgeText || liveBadge)
  };
}

/**
 * Filter an array of hackathons:
 * - Drops all ended hackathons
 * - Updates status and remaining days for ongoing hackathons
 * - Returns clean active list + count of purged events
 */
export function filterAndRefreshHackathons(hackathons, now = new Date()) {
  const active = [];
  let removedCount = 0;

  for (const h of hackathons) {
    const evalResult = evaluateHackathon(h, now);
    if (evalResult.isEnded) {
      removedCount++;
    } else {
      active.push({
        ...h,
        status: evalResult.status || h.status,
        badgeText: evalResult.badgeText || h.badgeText,
        _endDate: evalResult.endDate
      });
    }
  }

  // Sort: LIVE_NOW first (ending soonest first for maximum urgency), followed by UPCOMING
  active.sort((a, b) => {
    if (a.status === 'LIVE_NOW' && b.status !== 'LIVE_NOW') return -1;
    if (b.status === 'LIVE_NOW' && a.status !== 'LIVE_NOW') return 1;

    // If both have end dates, sort by ending soonest
    if (a._endDate && b._endDate) {
      return a._endDate.getTime() - b._endDate.getTime();
    }
    return 0;
  });

  return {
    activeHackathons: active.map(({ _endDate, ...rest }) => rest),
    removedCount
  };
}
