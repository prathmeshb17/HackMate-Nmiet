/**
 * Skill Similarity & Compatibility Engine
 * Uses Jaccard Similarity for skill sets & Cosine Similarity for quantitative vectors.
 *
 * Mathematical Definitions:
 * 1. Jaccard Index: J(A, B) = |A ∩ B| / |A ∪ B|
 * 2. Cosine Similarity: Cos(A, B) = (A · B) / (||A|| * ||B||)
 */

export function calculateJaccardSimilarity(skillsA = [], skillsB = []) {
  const setA = new Set(skillsA.map(s => s.trim().toLowerCase()));
  const setB = new Set(skillsB.map(s => s.trim().toLowerCase()));

  if (setA.size === 0 && setB.size === 0) {
    return { score: 1.0, intersection: [], union: [] };
  }

  const intersection = [];
  const unionSet = new Set(setA);

  for (const skill of setB) {
    unionSet.add(skill);
    if (setA.has(skill)) {
      intersection.push(skill);
    }
  }

  const union = Array.from(unionSet);
  const score = union.length > 0 ? intersection.length / union.length : 0;

  return {
    score: parseFloat(score.toFixed(4)),
    intersection,
    union,
    intersectionCount: intersection.length,
    unionCount: union.length
  };
}

export function calculateCosineSimilarity(vecA = [], vecB = []) {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  const cosSim = dotProduct / (normA * normB);
  return parseFloat(cosSim.toFixed(4));
}

export function calculateStudentCompatibility(seeker, candidate, hackathon = null) {
  if (!seeker || !candidate) return { compositeScore: 0, details: {} };

  // 1. Skill Jaccard Similarity
  const jaccard = calculateJaccardSimilarity(seeker.skills, candidate.skills);

  // 2. Hackathon Requirement Match
  let hackathonReqCoverage = 0;
  let requiredIntersection = [];
  if (hackathon && hackathon.requiredSkills) {
    const candidateSkillsSet = new Set(candidate.skills.map(s => s.trim().toLowerCase()));
    hackathon.requiredSkills.forEach(req => {
      if (candidateSkillsSet.has(req.trim().toLowerCase())) {
        requiredIntersection.push(req);
      }
    });
    hackathonReqCoverage = hackathon.requiredSkills.length > 0
      ? requiredIntersection.length / hackathon.requiredSkills.length
      : 1.0;
  } else {
    hackathonReqCoverage = jaccard.score;
  }

  // 3. Multi-Role Complementarity
  const seekerRoles = Array.isArray(seeker.preferredRoles) && seeker.preferredRoles.length > 0
    ? seeker.preferredRoles
    : [seeker.preferredRole || 'Fullstack'];
  const candidateRoles = Array.isArray(candidate.preferredRoles) && candidate.preferredRoles.length > 0
    ? candidate.preferredRoles
    : [candidate.preferredRole || 'Fullstack'];

  const hasOverlap = seekerRoles.some(r => candidateRoles.includes(r));
  let roleScore = 0.6;
  if (!hasOverlap) {
    roleScore = 1.0; // Perfect complementary roles (e.g. Frontend + Backend)
  } else if (seekerRoles.includes('Fullstack') || candidateRoles.includes('Fullstack')) {
    roleScore = 0.8;
  } else {
    roleScore = 0.6;
  }

  // 4. Numerical Vector Cosine Similarity
  const levelMap = { 'Beginner': 1, 'Intermediate': 3, 'Advanced': 4, 'Expert': 5 };
  const expA = levelMap[seeker.experienceLevel] || 2;
  const expB = levelMap[candidate.experienceLevel] || 2;
  const hA = Math.min(seeker.pastHackathons || 0, 10);
  const hB = Math.min(candidate.pastHackathons || 0, 10);

  const cosineScore = calculateCosineSimilarity([expA, hA], [expB, hB]);

  // 5. Availability Overlap
  const availA = seeker.availabilityHours || 15;
  const availB = candidate.availabilityHours || 15;
  const availRatio = 1 - Math.abs(availA - availB) / Math.max(availA, availB, 1);

  const compositeRatio = (
    jaccard.score * 0.35 +
    hackathonReqCoverage * 0.25 +
    roleScore * 0.20 +
    cosineScore * 0.10 +
    availRatio * 0.10
  );

  const compositeScore = Math.min(100, Math.round(compositeRatio * 100));

  return {
    compositeScore,
    details: {
      jaccardScore: jaccard.score,
      jaccardPercentage: Math.round(jaccard.score * 100),
      intersection: jaccard.intersection,
      union: jaccard.union,
      hackathonReqCoveragePercentage: Math.round(hackathonReqCoverage * 100),
      requiredIntersection,
      roleComplementary: !hasOverlap,
      roleScore,
      cosineScore,
      availRatio
    }
  };
}
