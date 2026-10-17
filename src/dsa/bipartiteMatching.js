/**
 * Maximum Bipartite Matching (Augmenting Paths / Ford-Fulkerson principle)
 * Solves the Optimal Role Allocation problem for Hackathons:
 * Matches a set of qualified Students (U) to open Squad Vacancies / Roles (V).
 *
 * Problem Formulation:
 * - Left Set U: Student applicants
 * - Right Set V: Team open roles (e.g. 'Team Alpha - Frontend', 'Team Beta - ML')
 * - Undirected bipartite edge (u, v) exists iff student u qualifies for role v.
 * - Goal: Find a subset of edges M of maximum cardinality such that no two edges share an endpoint.
 *
 * Time Complexity: O(V * E) where V is the number of vertices and E is the number of edges.
 * Space Complexity: O(V + E) for adjacency list and matched state tracking.
 */

export function findMaximumBipartiteMatching(candidates, roles, customEdges = null) {
  // candidate: { id, name, skills, preferredRole }
  // role: { id, title, requiredSkills, teamName }

  // Build Adjacency List: candidateId -> Array of roleIds
  const adj = {};
  candidates.forEach(c => {
    adj[c.id] = [];
  });

  const allEdges = [];

  if (customEdges) {
    // Custom predefined edges: { [candidateId]: [roleId, ...] }
    candidates.forEach(c => {
      const allowedRoles = customEdges[c.id] || [];
      allowedRoles.forEach(roleId => {
        if (roles.some(r => r.id === roleId)) {
          adj[c.id].push(roleId);
          allEdges.push({
            candidateId: c.id,
            candidateName: c.name,
            roleId,
            roleTitle: roles.find(r => r.id === roleId)?.title || roleId
          });
        }
      });
    });
  } else {
    // Automatic qualification criteria:
    // Candidate qualifies if preferredRole matches or at least one required skill matches
    candidates.forEach(c => {
      const cSkillsLower = (c.skills || []).map(s => s.toLowerCase());
      const cRole = (c.preferredRole || '').toLowerCase();

      roles.forEach(r => {
        const rTitleLower = (r.title || '').toLowerCase();
        const rReqsLower = (r.requiredSkills || []).map(s => s.toLowerCase());

        const roleMatch = rTitleLower.includes(cRole) || cRole.includes(rTitleLower);
        const skillMatch = rReqsLower.some(req => cSkillsLower.includes(req));

        if (roleMatch || skillMatch) {
          adj[c.id].push(r.id);
          allEdges.push({
            candidateId: c.id,
            candidateName: c.name,
            roleId: r.id,
            roleTitle: r.title,
            teamName: r.teamName
          });
        }
      });
    });
  }

  // matchRole[roleId] = candidateId (who is currently assigned to this role)
  const matchRole = {};
  roles.forEach(r => {
    matchRole[r.id] = null;
  });

  const stepTraces = [];

  // DFS function to find augmenting path from candidate u
  function dfsAugmentingPath(uId, visitedRoles, pathTrace) {
    const candidateObj = candidates.find(c => c.id === uId);
    const candidateName = candidateObj?.name || uId;

    const availableRoles = adj[uId] || [];

    for (const roleId of availableRoles) {
      if (!visitedRoles.has(roleId)) {
        visitedRoles.add(roleId);
        const roleObj = roles.find(r => r.id === roleId);
        const roleTitle = roleObj?.title || roleId;

        // If role is free OR role's current occupant can find another alternative role
        if (matchRole[roleId] === null) {
          // Free role found! Augmenting path completes here.
          pathTrace.push({
            candidateId: uId,
            candidateName,
            roleId,
            roleTitle,
            status: 'MATCHED_DIRECTLY'
          });
          matchRole[roleId] = uId;
          return true;
        } else {
          // Role is currently occupied by previous occupant
          const prevOccupantId = matchRole[roleId];
          const prevOccupantObj = candidates.find(c => c.id === prevOccupantId);
          const prevOccupantName = prevOccupantObj?.name || prevOccupantId;

          pathTrace.push({
            candidateId: uId,
            candidateName,
            roleId,
            roleTitle,
            currentOccupant: prevOccupantName,
            status: 'TRYING_REASSIGNMENT'
          });

          // Recursive call: Can prevOccupant find another role?
          if (dfsAugmentingPath(prevOccupantId, visitedRoles, pathTrace)) {
            // Yes, reassignment succeeded! uId takes this role.
            matchRole[roleId] = uId;
            return true;
          }
        }
      }
    }
    return false;
  }

  // Run DFS for each candidate
  let maxMatchingCount = 0;

  candidates.forEach(c => {
    const visitedRoles = new Set();
    const pathTrace = [];

    const foundAugmenting = dfsAugmentingPath(c.id, visitedRoles, pathTrace);

    if (foundAugmenting) {
      maxMatchingCount++;
      stepTraces.push({
        candidateId: c.id,
        candidateName: c.name,
        success: true,
        path: pathTrace,
        description: `Augmenting path found for ${c.name}. Total matches increased to ${maxMatchingCount}.`
      });
    } else {
      stepTraces.push({
        candidateId: c.id,
        candidateName: c.name,
        success: false,
        path: pathTrace,
        description: `No augmenting path found for ${c.name}; all qualified roles are blocked.`
      });
    }
  });

  // Prepare final matched assignments
  const assignments = [];
  const matchedCandidateIds = new Set();

  roles.forEach(r => {
    const assignedCandId = matchRole[r.id];
    if (assignedCandId) {
      matchedCandidateIds.add(assignedCandId);
      const candObj = candidates.find(c => c.id === assignedCandId);
      assignments.push({
        roleId: r.id,
        roleTitle: r.title,
        teamName: r.teamName,
        candidateId: assignedCandId,
        candidateName: candObj ? candObj.name : assignedCandId,
        candidateRole: candObj?.preferredRole || 'Developer',
        skills: candObj?.skills || []
      });
    }
  });

  const unmatchedCandidates = candidates.filter(c => !matchedCandidateIds.has(c.id));
  const unfilledRoles = roles.filter(r => matchRole[r.id] === null);

  // Graph representation for visualization
  const graphData = {
    leftNodes: candidates.map(c => ({
      id: c.id,
      name: c.name,
      role: c.preferredRole || 'Developer',
      isMatched: matchedCandidateIds.has(c.id)
    })),
    rightNodes: roles.map(r => ({
      id: r.id,
      title: r.title,
      teamName: r.teamName,
      isMatched: matchRole[r.id] !== null,
      assignedTo: matchRole[r.id] ? candidates.find(c => c.id === matchRole[r.id])?.name : null
    })),
    edges: allEdges.map(e => ({
      ...e,
      isMatched: matchRole[e.roleId] === e.candidateId
    }))
  };

  return {
    maxMatchingCount,
    totalCandidates: candidates.length,
    totalRoles: roles.length,
    assignments,
    unmatchedCandidates,
    unfilledRoles,
    stepTraces,
    graphData
  };
}
