/**
 * Set Difference & Team Completeness Engine
 * Calculates skill gaps by modeling required hackathon skills vs team's current skills.
 *
 * Mathematical Set Operations:
 * 1. Missing Skills (Gap) = RequiredSkills \ TeamSkills (Set Difference R \ T)
 * 2. Fulfilled Skills     = RequiredSkills ∩ TeamSkills (Intersection R ∩ T)
 * 3. Extra Skills         = TeamSkills \ RequiredSkills (Set Difference T \ R)
 *
 * Time Complexity: O(|R| + |T|) where |R| is required skills count, |T| is team skills count.
 * Space Complexity: O(|R| + |T|) for output set allocation.
 */

export function analyzeTeamSkillGap(requiredSkills = [], teamMembers = []) {
  // Aggregate all team member skills into a set (Union of all member skills)
  const teamSkillsSet = new Set();
  const memberSkillsMap = new Map(); // skill -> Array of member names

  teamMembers.forEach(member => {
    (member.skills || []).forEach(skill => {
      const normalized = skill.trim().toLowerCase();
      teamSkillsSet.add(normalized);
      if (!memberSkillsMap.has(normalized)) {
        memberSkillsMap.set(normalized, []);
      }
      memberSkillsMap.get(normalized).push(member.name);
    });
  });

  const requiredNormalized = requiredSkills.map(s => s.trim());
  const missingSkills = [];
  const fulfilledSkills = [];

  requiredNormalized.forEach(req => {
    const normReq = req.toLowerCase();
    if (teamSkillsSet.has(normReq)) {
      fulfilledSkills.push({
        skill: req,
        coveredBy: memberSkillsMap.get(normReq) || []
      });
    } else {
      missingSkills.push(req);
    }
  });

  // Calculate surplus/extra skills
  const reqSet = new Set(requiredNormalized.map(r => r.toLowerCase()));
  const extraSkills = [];
  teamSkillsSet.forEach(skill => {
    if (!reqSet.has(skill)) {
      extraSkills.push(skill);
    }
  });

  const totalRequired = requiredSkills.length;
  const coveragePercentage = totalRequired > 0
    ? Math.round((fulfilledSkills.length / totalRequired) * 100)
    : 100;

  // Skill role gap categorization
  const roleGaps = inferRoleGaps(missingSkills);

  return {
    coveragePercentage,
    totalRequired,
    fulfilledCount: fulfilledSkills.length,
    missingCount: missingSkills.length,
    missingSkills,
    fulfilledSkills,
    extraSkills,
    roleGaps,
    isComplete: missingSkills.length === 0
  };
}

/**
 * Maps missing skills to higher-level role recommendations.
 */
function inferRoleGaps(missingSkills = []) {
  const roleRules = [
    { role: 'Frontend Engineer', triggers: ['react', 'vue', 'angular', 'tailwind', 'ui/ux', 'css', 'html', 'next.js', 'flutter'] },
    { role: 'Backend Engineer', triggers: ['node.js', 'express', 'python', 'flask', 'django', 'postgresql', 'mongodb', 'sql', 'rest api', 'docker'] },
    { role: 'AI / Machine Learning Engineer', triggers: ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'nlp', 'llm', 'computer vision'] },
    { role: 'UI/UX Designer', triggers: ['figma', 'design', 'prototyping', 'wireframing', 'user research', 'ui/ux'] },
    { role: 'Cloud / DevOps Engineer', triggers: ['aws', 'docker', 'kubernetes', 'ci/cd', 'gcp', 'azure', 'devops'] }
  ];

  const suggestedRoles = new Set();
  const lowerMissing = missingSkills.map(s => s.toLowerCase());

  roleRules.forEach(rule => {
    const hasTrigger = rule.triggers.some(t => lowerMissing.includes(t));
    if (hasTrigger) {
      suggestedRoles.add(rule.role);
    }
  });

  if (missingSkills.length > 0 && suggestedRoles.size === 0) {
    suggestedRoles.add('Specialized Tech Lead');
  }

  return Array.from(suggestedRoles);
}
