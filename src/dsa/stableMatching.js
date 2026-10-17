/**
 * Gale-Shapley Stable Matching Algorithm (Deferred Acceptance)
 * Solves the Stable Team-Candidate Assignment problem for Hackathons.
 *
 * Problem Formulation:
 * - Given N Teams (proposers) and N Candidates (acceptors).
 * - Each team has a ranked preference list of candidates based on required skills & synergy.
 * - Each candidate has a ranked preference list of teams based on hackathon interest & tech stack.
 * - Goal: Find a stable matching where NO pair (Team, Candidate) mutually prefer each other
 *   over their assigned matches (i.e. zero blocking pairs).
 *
 * Time Complexity: O(N^2) worst case, where N is the number of participants.
 * Space Complexity: O(N^2) for preference rankings and lookup tables.
 */

export function runGaleShapley(teamsPreferences, candidatesPreferences) {
  // teamsPreferences: { [teamId]: [candidateId1, candidateId2, ...] }
  // candidatesPreferences: { [candidateId]: [teamId1, teamId2, ...] }

  const teams = Object.keys(teamsPreferences);
  const candidates = Object.keys(candidatesPreferences);

  // Fast lookup: candidate's ranking index for each team (lower index = higher preference)
  const candidateRankings = {};
  candidates.forEach(candId => {
    candidateRankings[candId] = {};
    const prefs = candidatesPreferences[candId] || [];
    prefs.forEach((teamId, index) => {
      candidateRankings[candId][teamId] = index;
    });
  });

  // Track the next candidate index each team will propose to
  const nextProposalIndex = {};
  teams.forEach(t => {
    nextProposalIndex[t] = 0;
  });

  // Free teams queue (initially all teams are free)
  const freeTeams = [...teams];

  // Current engagements: candidateId -> teamId
  const candidateEngagement = {};

  // Trace of every round for live visualizer stepping
  const stepTraces = [];
  let roundNumber = 1;

  while (freeTeams.length > 0) {
    const currentTeam = freeTeams.shift();
    const teamPrefs = teamsPreferences[currentTeam] || [];
    const proposalIdx = nextProposalIndex[currentTeam];

    if (proposalIdx >= teamPrefs.length) {
      // Team has exhausted all proposals
      stepTraces.push({
        round: roundNumber++,
        action: 'EXHAUSTED',
        team: currentTeam,
        candidate: null,
        description: `Team ${currentTeam} has proposed to all candidates and remains unmatched.`
      });
      continue;
    }

    const targetCandidate = teamPrefs[proposalIdx];
    nextProposalIndex[currentTeam]++;

    const currentFiance = candidateEngagement[targetCandidate];

    if (!currentFiance) {
      // Candidate is currently free -> Tentatively accept
      candidateEngagement[targetCandidate] = currentTeam;
      stepTraces.push({
        round: roundNumber++,
        action: 'ENGAGED_NEW',
        team: currentTeam,
        candidate: targetCandidate,
        previousTeam: null,
        description: `${targetCandidate} was free and accepted proposal from ${currentTeam}.`
      });
    } else {
      // Candidate is already engaged -> Compare current engagement with new proposal
      const rankCurrent = candidateRankings[targetCandidate]?.[currentFiance] ?? Infinity;
      const rankNew = candidateRankings[targetCandidate]?.[currentTeam] ?? Infinity;

      if (rankNew < rankCurrent) {
        // Candidate prefers new team! Dump old team, engage with new team.
        candidateEngagement[targetCandidate] = currentTeam;
        freeTeams.push(currentFiance);

        stepTraces.push({
          round: roundNumber++,
          action: 'SWITCH_ENGAGEMENT',
          team: currentTeam,
          candidate: targetCandidate,
          previousTeam: currentFiance,
          description: `${targetCandidate} dumps ${currentFiance} (rank #${rankCurrent + 1}) to accept higher-preferred ${currentTeam} (rank #${rankNew + 1})!`
        });
      } else {
        // Candidate rejects new team -> currentTeam remains free
        freeTeams.push(currentTeam);

        stepTraces.push({
          round: roundNumber++,
          action: 'REJECTED',
          team: currentTeam,
          candidate: targetCandidate,
          previousTeam: currentFiance,
          description: `${targetCandidate} rejected ${currentTeam} in favor of current match ${currentFiance}.`
        });
      }
    }
  }

  // Format final matching results
  const matches = [];
  Object.entries(candidateEngagement).forEach(([candId, teamId]) => {
    matches.push({
      team: teamId,
      candidate: candId,
      teamPreferenceRank: (teamsPreferences[teamId]?.indexOf(candId) ?? -1) + 1,
      candidatePreferenceRank: (candidatesPreferences[candId]?.indexOf(teamId) ?? -1) + 1
    });
  });

  // Verify Stability: check for blocking pairs
  // A blocking pair exists if Team T and Candidate C both strictly prefer each other over their assigned partners.
  const blockingPairs = [];
  teams.forEach(t => {
    const assignedCand = matches.find(m => m.team === t)?.candidate;
    const tPrefList = teamsPreferences[t] || [];

    candidates.forEach(c => {
      const assignedTeam = candidateEngagement[c];

      // Does team T prefer C over assignedCand?
      const tRankAssigned = assignedCand ? tPrefList.indexOf(assignedCand) : Infinity;
      const tRankC = tPrefList.indexOf(c);
      const teamPrefersC = tRankC !== -1 && tRankC < tRankAssigned;

      // Does candidate C prefer T over assignedTeam?
      const cRankAssigned = assignedTeam ? (candidateRankings[c]?.[assignedTeam] ?? Infinity) : Infinity;
      const cRankT = candidateRankings[c]?.[t] ?? Infinity;
      const candidatePrefersT = cRankT !== -1 && cRankT < cRankAssigned;

      if (teamPrefersC && candidatePrefersT) {
        blockingPairs.push({ team: t, candidate: c });
      }
    });
  });

  return {
    isStable: blockingPairs.length === 0,
    blockingPairs,
    matches,
    stepTraces,
    totalRounds: stepTraces.length
  };
}
