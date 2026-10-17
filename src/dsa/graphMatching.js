/**
 * Graph-Based Team Suggestion Engine
 * Models students as graph nodes and compatibility scores as weighted edges.
 * Performs Greedy Weighted Maximum Matching to automatically cluster students into balanced teams.
 *
 * Algorithm Strategy:
 * 1. Build Adjacency Matrix / Edge List for all student pairs (V nodes, V*(V-1)/2 edges).
 * 2. Calculate pairwise compatibility edge weights using Jaccard + Cosine matcher.
 * 3. Sort edges descending by score in O(E log E) time.
 * 4. Greedily iterate edges, forming clusters up to target team size limit.
 *
 * Time Complexity:
 * - Edge Generation: O(V^2 * (S + D)) where S is avg skill count, D is vector dimensions.
 * - Edge Sorting: O(E log E) where E = O(V^2).
 * - Greedy Matching: O(E * α(V)) with Union-Find cluster tracking.
 * - Total Complexity: O(V^2 log V).
 *
 * Space Complexity: O(V^2) for storing graph edges and adjacency lists.
 */

import { calculateStudentCompatibility } from './similarity.js';

export function formOptimalTeamsGraph(students = [], targetTeamSize = 3, hackathon = null) {
  if (students.length === 0) return { teams: [], unassigned: [], graphData: { nodes: [], edges: [] } };

  // Step 1: Build nodes and edges
  const nodes = students.map(s => ({ id: s.id, name: s.name, role: s.preferredRole, skills: s.skills }));
  const edges = [];

  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      const s1 = students[i];
      const s2 = students[j];
      const match = calculateStudentCompatibility(s1, s2, hackathon);
      edges.push({
        source: s1.id,
        target: s2.id,
        sourceName: s1.name,
        targetName: s2.name,
        weight: match.compositeScore,
        details: match.details
      });
    }
  }

  // Step 2: Sort edges descending by weight
  edges.sort((a, b) => b.weight - a.weight);

  // Step 3: Greedy Cluster Assignment using custom Disjoint Set map
  const teamAssignment = new Map(); // studentId -> teamId
  const teamMembers = new Map();    // teamId -> Array of student objects
  let nextTeamId = 1;

  const executionSteps = [];

  edges.forEach(edge => {
    const t1 = teamAssignment.get(edge.source);
    const t2 = teamAssignment.get(edge.target);

    // Case 1: Neither student is in a team yet
    if (!t1 && !t2) {
      const teamId = `TEAM-${nextTeamId++}`;
      const s1 = students.find(s => s.id === edge.source);
      const s2 = students.find(s => s.id === edge.target);

      teamAssignment.set(edge.source, teamId);
      teamAssignment.set(edge.target, teamId);
      teamMembers.set(teamId, [s1, s2]);

      executionSteps.push({
        action: 'CREATED_NEW_TEAM',
        teamId,
        students: [edge.sourceName, edge.targetName],
        edgeWeight: edge.weight
      });
    }
    // Case 2: Source in team, target unassigned -> Add target if capacity permits
    else if (t1 && !t2) {
      const members = teamMembers.get(t1);
      if (members.length < targetTeamSize) {
        const s2 = students.find(s => s.id === edge.target);
        teamAssignment.set(edge.target, t1);
        members.push(s2);

        executionSteps.push({
          action: 'ADDED_TO_TEAM',
          teamId: t1,
          addedStudent: edge.targetName,
          edgeWeight: edge.weight
        });
      }
    }
    // Case 3: Target in team, source unassigned -> Add source if capacity permits
    else if (!t1 && t2) {
      const members = teamMembers.get(t2);
      if (members.length < targetTeamSize) {
        const s1 = students.find(s => s.id === edge.source);
        teamAssignment.set(edge.source, t2);
        members.push(s1);

        executionSteps.push({
          action: 'ADDED_TO_TEAM',
          teamId: t2,
          addedStudent: edge.sourceName,
          edgeWeight: edge.weight
        });
      }
    }
    // Case 4: Both in different teams -> Merge teams if combined size <= targetTeamSize
    else if (t1 !== t2) {
      const m1 = teamMembers.get(t1);
      const m2 = teamMembers.get(t2);
      if (m1 && m2 && (m1.length + m2.length) <= targetTeamSize) {
        // Merge t2 into t1
        m2.forEach(member => {
          teamAssignment.set(member.id, t1);
          m1.push(member);
        });
        teamMembers.delete(t2);

        executionSteps.push({
          action: 'MERGED_TEAMS',
          mergedTeam: t1,
          dissolvedTeam: t2,
          edgeWeight: edge.weight
        });
      }
    }
  });

  // Step 4: Collect remaining unassigned students into solo or remaining teams
  const unassigned = students.filter(s => !teamAssignment.has(s.id));
  const finalTeams = [];

  for (const [teamId, members] of teamMembers.entries()) {
    // Calculate average internal compatibility of team
    let totalCompat = 0;
    let count = 0;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const match = calculateStudentCompatibility(members[i], members[j], hackathon);
        totalCompat += match.compositeScore;
        count++;
      }
    }
    const avgScore = count > 0 ? Math.round(totalCompat / count) : 100;

    finalTeams.push({
      teamId,
      name: `Suggested Squad ${teamId.split('-')[1]}`,
      members,
      avgCompatibilityScore: avgScore,
      memberCount: members.length
    });
  }

  return {
    teams: finalTeams,
    unassigned,
    executionSteps,
    graphData: {
      nodes,
      edges: edges.slice(0, 15) // Top 15 highest affinity edges for visualization
    }
  };
}
