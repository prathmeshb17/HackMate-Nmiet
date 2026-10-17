import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hifwnpddmxalfpnqujel.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kVi4wR2BlEWQVwIU5HVUoQ_Z-aFegcD';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'YOUR_ANON_KEY_HERE'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function hashPassword(password, salt = 'hackmate_salt_2026') {
  if (!password) return '';
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==========================================
// 1. STUDENTS SYNC HELPERS
// ==========================================
export function mapStudentFromDb(s) {
  if (!s) return null;

  let resumeUrl = s.resume || '';
  let passwordHash = s.password_hash || '';
  let username = s.username || '';

  if (s.resume && s.resume.startsWith('{"')) {
    try {
      const parsed = JSON.parse(s.resume);
      if (parsed.passwordHash || parsed.username) {
        resumeUrl = parsed.url || '';
        passwordHash = parsed.passwordHash || passwordHash;
        username = parsed.username || username;
      }
    } catch {}
  }

  // Fallback username from email or name if none set
  if (!username) {
    if (s.email && s.email.includes('@')) {
      username = s.email.split('@')[0];
    } else if (s.name) {
      username = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
  }

  return {
    id: s.id,
    name: s.name,
    username: username,
    passwordHash: passwordHash,
    college: s.college,
    branch: s.branch,
    div: s.div,
    email: s.email,
    github: s.github || '',
    linkedin: s.linkedin || '',
    phone: s.phone || '',
    resume: resumeUrl,
    title: s.title || '',
    preferredRole: s.preferred_role || 'Fullstack',
    preferredRoles: s.preferred_roles || [s.preferred_role || 'Fullstack'],
    experienceLevel: s.experience_level || 'Intermediate',
    availabilityHours: s.availability_hours || 20,
    pastHackathons: s.past_hackathons || 0,
    bio: s.bio || '',
    skills: s.skills || [],
    avatar: s.avatar
  };
}

export async function getCloudStudents() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getStudents error:', error);
      return null;
    }
    return (data || []).map(mapStudentFromDb);
  } catch (err) {
    console.error('getCloudStudents failed:', err);
    return null;
  }
}

export async function findCloudStudent(identifier) {
  if (!supabase || !identifier) return null;
  try {
    const q = identifier.trim().toLowerCase();
    const { data, error } = await supabase
      .from('students')
      .select('*');

    if (error || !data) return null;

    const mapped = data.map(mapStudentFromDb);
    return mapped.find(s => {
      const email = (s.email || '').toLowerCase();
      const uname = (s.username || '').toLowerCase();
      const github = (s.github || '').toLowerCase().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
      const name = (s.name || '').toLowerCase();
      return email === q || uname === q || github === q || name === q || s.id.toLowerCase() === q;
    }) || null;
  } catch (err) {
    console.error('findCloudStudent error:', err);
    return null;
  }
}

export async function saveCloudStudent(student) {
  if (!supabase || !student) return null;
  try {
    const resumePayload = JSON.stringify({
      url: student.resume || '',
      passwordHash: student.passwordHash || '',
      username: student.username || ''
    });

    const { data, error } = await supabase
      .from('students')
      .upsert({
        id: student.id,
        name: student.name,
        college: student.college,
        branch: student.branch,
        div: student.div,
        email: student.email,
        github: student.github || '',
        linkedin: student.linkedin || '',
        phone: student.phone || '',
        resume: resumePayload,
        title: student.title || '',
        preferred_role: student.preferredRole || 'Fullstack',
        preferred_roles: student.preferredRoles || [student.preferredRole || 'Fullstack'],
        experience_level: student.experienceLevel || 'Intermediate',
        availability_hours: student.availabilityHours || 20,
        past_hackathons: student.pastHackathons || 0,
        bio: student.bio || '',
        skills: student.skills || [],
        avatar: student.avatar,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) console.warn('Supabase saveStudent error:', error);
    return data;
  } catch (err) {
    console.error('saveCloudStudent failed:', err);
    return null;
  }
}


// ==========================================
// 2. TEAMS SYNC HELPERS
// ==========================================
export function mapTeamFromDb(t) {
  if (!t) return null;
  return {
    id: t.id,
    name: t.name,
    hackathonId: t.hackathon_id,
    hackathonTitle: t.hackathon_title,
    leaderId: t.leader_id,
    members: t.members || [],
    status: t.status || 'Recruiting',
    maxMembers: t.max_members || 4,
    pitch: t.pitch || '',
    lookingForRoles: t.looking_for_roles || [],
    requiredSkills: t.required_skills || [],
    experienceLevel: t.experience_level || 'All Levels',
    timeCommitment: t.time_commitment || '10-20 hrs/week',
    workingMode: t.working_mode || 'Remote',
    requirementsNote: t.requirements_note || '',
    projectLinks: t.project_links || {},
    milestones: t.milestones || [],
    canvasNotes: t.canvas_notes || '',
    createdAt: t.created_at
  };
}

export async function getCloudTeams() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getTeams error:', error);
      return null;
    }

    return (data || []).map(mapTeamFromDb);
  } catch (err) {
    console.error('getCloudTeams failed:', err);
    return null;
  }
}

export async function saveCloudTeam(team) {
  if (!supabase || !team) return null;
  try {
    const { data, error } = await supabase
      .from('teams')
      .upsert({
        id: team.id,
        name: team.name,
        hackathon_id: team.hackathonId,
        hackathon_title: team.hackathonTitle,
        leader_id: team.leaderId,
        members: team.members || [],
        status: team.status || 'Recruiting',
        max_members: team.maxMembers || 4,
        pitch: team.pitch || '',
        looking_for_roles: team.lookingForRoles || [],
        required_skills: team.requiredSkills || [],
        experience_level: team.experienceLevel || 'All Levels',
        time_commitment: team.timeCommitment || '10-20 hrs/week',
        working_mode: team.workingMode || 'Remote',
        requirements_note: team.requirementsNote || '',
        project_links: team.projectLinks || {},
        milestones: team.milestones || [],
        canvas_notes: team.canvasNotes || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) console.warn('Supabase saveTeam error:', error);
    return data;
  } catch (err) {
    console.error('saveCloudTeam failed:', err);
    return null;
  }
}

export async function deleteCloudTeam(teamId) {
  if (!supabase || !teamId) return null;
  try {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);
    if (error) console.warn('Supabase deleteTeam error:', error);
  } catch (err) {
    console.error('deleteCloudTeam failed:', err);
  }
}

// ==========================================
// 3. TEAM MESSAGES SYNC HELPERS
// ==========================================
export function mapMessageFromDb(m) {
  if (!m) return null;
  return {
    id: m.id,
    teamId: m.team_id,
    senderId: m.sender_id,
    senderName: m.sender_name,
    senderAvatar: m.sender_avatar,
    senderRole: m.sender_role,
    text: m.text,
    isCode: m.is_code || false,
    isSystem: m.is_system || false,
    timestamp: m.timestamp
  };
}

export async function getCloudMessages() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('team_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) return null;

    const grouped = {};
    (data || []).forEach(m => {
      const tId = m.team_id;
      if (!grouped[tId]) grouped[tId] = [];
      grouped[tId].push(mapMessageFromDb(m));
    });
    return grouped;
  } catch (err) {
    console.error('getCloudMessages failed:', err);
    return null;
  }
}

export async function saveCloudMessage(teamId, message) {
  if (!supabase || !teamId || !message) return null;
  try {
    const { error } = await supabase
      .from('team_messages')
      .insert({
        id: message.id,
        team_id: teamId,
        sender_id: message.senderId,
        sender_name: message.senderName,
        sender_avatar: message.senderAvatar,
        sender_role: message.senderRole,
        text: message.text,
        is_code: message.isCode || false,
        is_system: message.isSystem || false,
        timestamp: message.timestamp
      });
    if (error) console.warn('Supabase saveMessage error:', error);
  } catch (err) {
    console.error('saveCloudMessage failed:', err);
  }
}

// ==========================================
// 4. NOTIFICATIONS SYNC HELPERS
// ==========================================
export function mapNotificationFromDb(n) {
  if (!n) return null;
  return {
    id: n.id,
    type: n.type,
    recipientId: n.recipient_id,
    senderTeamId: n.sender_team_id,
    senderTeamName: n.sender_team_name,
    senderLeaderName: n.sender_leader_name,
    applicantId: n.applicant_id,
    applicantName: n.applicant_name,
    hackathonId: n.hackathon_id,
    hackathonTitle: n.hackathon_title,
    roleOffered: n.role_offered,
    message: n.message,
    matchScore: n.match_score || 85,
    status: n.status || 'PENDING',
    timestamp: n.timestamp
  };
}

export async function getCloudNotifications() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return null;

    return (data || []).map(mapNotificationFromDb);
  } catch (err) {
    console.error('getCloudNotifications failed:', err);
    return null;
  }
}

export async function saveCloudNotification(notif) {
  if (!supabase || !notif) return null;
  try {
    const { error } = await supabase
      .from('notifications')
      .upsert({
        id: notif.id,
        type: notif.type,
        recipient_id: notif.recipientId,
        sender_team_id: notif.senderTeamId,
        sender_team_name: notif.senderTeamName,
        sender_leader_name: notif.senderLeaderName,
        applicant_id: notif.applicantId,
        applicant_name: notif.applicantName,
        hackathon_id: notif.hackathonId,
        hackathon_title: notif.hackathonTitle,
        role_offered: notif.roleOffered,
        message: notif.message,
        match_score: notif.matchScore || 85,
        status: notif.status || 'PENDING',
        timestamp: notif.timestamp,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    if (error) console.warn('Supabase saveNotification error:', error);
  } catch (err) {
    console.error('saveCloudNotification failed:', err);
  }
}

// ==========================================
// 5. REAL-TIME SUBSCRIPTION ENGINE
// ==========================================
export function subscribeToRealtimeChanges({
  onStudentChange,
  onTeamChange,
  onMessageChange,
  onNotificationChange
}) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('hackmate-realtime-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, payload => {
      if (onStudentChange) {
        if (payload.eventType === 'DELETE') {
          onStudentChange({ type: 'DELETE', id: payload.old.id });
        } else {
          onStudentChange({ type: payload.eventType, student: mapStudentFromDb(payload.new) });
        }
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, payload => {
      if (onTeamChange) {
        if (payload.eventType === 'DELETE') {
          onTeamChange({ type: 'DELETE', id: payload.old.id });
        } else {
          onTeamChange({ type: payload.eventType, team: mapTeamFromDb(payload.new) });
        }
      }
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'team_messages' }, payload => {
      if (onMessageChange) {
        onMessageChange({
          teamId: payload.new.team_id,
          message: mapMessageFromDb(payload.new)
        });
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, payload => {
      if (onNotificationChange) {
        if (payload.eventType === 'DELETE') {
          onNotificationChange({ type: 'DELETE', id: payload.old.id });
        } else {
          onNotificationChange({ type: payload.eventType, notification: mapNotificationFromDb(payload.new) });
        }
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
