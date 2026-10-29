import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_STUDENTS } from './data/initialStudents.js';
import { INITIAL_HACKATHONS } from './data/initialHackathons.js';
import { INITIAL_TEAMS } from './data/initialTeams.js';
import { INITIAL_NOTIFICATIONS } from './data/initialNotifications.js';
import { DisjointSet } from './dsa/unionFind.js';

import Navbar from './components/Navbar.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import OnboardingModal from './components/OnboardingModal.jsx';
import LoginModal from './components/LoginModal.jsx';
import TeamChatModal from './components/TeamChatModal.jsx';
import HostHackathonModal from './components/HostHackathonModal.jsx';
import InviteToTeamModal from './components/InviteToTeamModal.jsx';
import SquadRegistrationPacketModal from './components/SquadRegistrationPacketModal.jsx';
import RealTimeScanModal from './components/RealTimeScanModal.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Discovery from './pages/Discovery.jsx';
import TeamsHub from './pages/TeamsHub.jsx';
import AutoTeamGenerator from './pages/AutoTeamGenerator.jsx';
import NotificationsTab from './pages/NotificationsTab.jsx';

import {
  fetchAllLiveHackathons,
  fetchQuickLiveHackathons,
  performRealTimeHackathonScan,
  saveHostedHackathon,
  getHostedHackathons,
  TOTAL_UNSTOP_OPPORTUNITIES,
  TOTAL_DEVPOST_OPPORTUNITIES
} from './services/hackathonService.js';
import { filterAndRefreshHackathons } from './utils/dateValidator.js';
import {
  isSupabaseConfigured,
  getCloudStudents,
  saveCloudStudent,
  getCloudTeams,
  saveCloudTeam,
  deleteCloudTeam,
  getCloudMessages,
  saveCloudMessage,
  getCloudNotifications,
  saveCloudNotification,
  subscribeToRealtimeChanges
} from './services/supabaseClient.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('hackmate_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out any demo seeds if previously loaded
        return parsed.filter(s => !s.id.startsWith('s-alex') && !s.id.startsWith('s-priya') && !s.id.startsWith('s-marcus') && !s.id.startsWith('s-sofia') && !s.id.startsWith('s-david') && !s.id.startsWith('s-elena'));
      }
      return INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });
  const [currentStudentId, setCurrentStudentId] = useState(() => {
    try {
      const id = localStorage.getItem('hackmate_current_student_id');
      if (id && (id.startsWith('s-alex') || id.startsWith('s-priya') || id.startsWith('s-marcus') || id.startsWith('s-sofia') || id.startsWith('s-david') || id.startsWith('s-elena'))) {
        return null;
      }
      return id || null;
    } catch {
      return null;
    }
  });

  const HACKATHONS_SYNC_VERSION = 'v2026_10_17_live_clean_354';

  const [hackathons, setHackathons] = useState(() => {
    try {
      const hosted = getHostedHackathons();
      const storedVersion = localStorage.getItem('hackmate_hackathons_version');
      if (storedVersion !== HACKATHONS_SYNC_VERSION) {
        localStorage.removeItem('hackmate_hackathons');
        localStorage.setItem('hackmate_hackathons_version', HACKATHONS_SYNC_VERSION);
      }
      const saved = localStorage.getItem('hackmate_hackathons');
      const map = new Map();
      INITIAL_HACKATHONS.forEach(h => map.set(h.id, h));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(h => map.set(h.id, h));
        }
      }
      hosted.forEach(h => map.set(h.id, h));
      return Array.from(map.values());
    } catch {
      return INITIAL_HACKATHONS;
    }
  });
  const [teams, setTeams] = useState(() => {
    try {
      const saved = localStorage.getItem('hackmate_teams');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter(t => t.id !== 'team-01' && t.id !== 'team-02');
      }
      return INITIAL_TEAMS;
    } catch {
      return INITIAL_TEAMS;
    }
  });
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('hackmate_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });
  const [selectedHackathonForMatch, setSelectedHackathonForMatch] = useState(null);

  // Team Chat Messages State
  const [teamMessages, setTeamMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('hackmate_team_messages');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [activeChatTeam, setActiveChatTeam] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState('direct'); // 'direct' | 'picker'
  const [isNewHackathonModalOpen, setIsNewHackathonModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteModalCandidate, setInviteModalCandidate] = useState(null);
  const [registrationPacketTeam, setRegistrationPacketTeam] = useState(null);
  const [isRegistrationPacketOpen, setIsRegistrationPacketOpen] = useState(false);
  const [isRealTimeScanModalOpen, setIsRealTimeScanModalOpen] = useState(false);
  const [isScanningLive, setIsScanningLive] = useState(false);
  const [scanProgress, setScanProgress] = useState(null);
  const [scanReport, setScanReport] = useState(null);

  // Track profiles created or authorized on this device
  const [myCreatedProfileIds, setMyCreatedProfileIds] = useState(() => {
    try {
      const saved = localStorage.getItem('hackmate_my_created_profile_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      const initialIds = [];
      const currentId = localStorage.getItem('hackmate_current_student_id');
      if (currentId && !currentId.startsWith('s-alex') && !currentId.startsWith('s-priya') && !currentId.startsWith('s-marcus') && !currentId.startsWith('s-sofia') && !currentId.startsWith('s-david') && !currentId.startsWith('s-elena')) {
        initialIds.push(currentId);
      }
      const localStudentsRaw = localStorage.getItem('hackmate_students');
      if (localStudentsRaw) {
        const localStudents = JSON.parse(localStudentsRaw);
        if (Array.isArray(localStudents)) {
          localStudents.forEach(s => {
            if (s.id && s.id.startsWith('std-') && !initialIds.includes(s.id)) {
              initialIds.push(s.id);
            }
          });
        }
      }
      return initialIds;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hackmate_my_created_profile_ids', JSON.stringify(myCreatedProfileIds));
    } catch (e) {
      console.error(e);
    }
  }, [myCreatedProfileIds]);

  const handleOpenLoginModal = (tab = 'direct') => {
    setLoginModalTab(tab);
    setIsLoginModalOpen(true);
  };

  // Persist state changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('hackmate_students', JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  useEffect(() => {
    try {
      if (currentStudentId) {
        localStorage.setItem('hackmate_current_student_id', currentStudentId);
      } else {
        localStorage.removeItem('hackmate_current_student_id');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentStudentId]);


  useEffect(() => {
    try {
      localStorage.setItem('hackmate_teams', JSON.stringify(teams));
    } catch (e) {
      console.error(e);
    }
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem('hackmate_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('hackmate_team_messages', JSON.stringify(teamMessages));
    } catch (e) {
      console.error(e);
    }
  }, [teamMessages]);

  useEffect(() => {
    try {
      // Safe storage snapshot (top 200) to protect against browser 5MB quota limit
      localStorage.setItem('hackmate_hackathons', JSON.stringify(hackathons.slice(0, 200)));
    } catch (e) {
      console.warn('LocalStorage save skipped (quota limit protection):', e);
    }
  }, [hackathons]);

  const [isRefreshingLive, setIsRefreshingLive] = useState(false);
  const [isDeepSyncing, setIsDeepSyncing] = useState(false);
  const [deepSyncProgress, setDeepSyncProgress] = useState(null);
  const [lastSyncedTime, setLastSyncedTime] = useState(() => new Date());
  const [autoSyncAlert, setAutoSyncAlert] = useState(null);

  const currentStudent = useMemo(() => {
    if (!currentStudentId || students.length === 0) return null;
    return students.find(item => item.id === currentStudentId) || null;
  }, [students, currentStudentId]);

  const handleStudentSwitch = (id) => {
    setCurrentStudentId(id);
    if (id) {
      try { localStorage.setItem('hackmate_current_student_id', id); } catch (e) {}
    } else {
      try { localStorage.removeItem('hackmate_current_student_id'); } catch (e) {}
    }
  };

  const handleLoginSuccess = (student) => {
    setCurrentStudentId(student.id);
    setMyCreatedProfileIds(prev => {
      const updated = prev.includes(student.id) ? prev : [student.id, ...prev];
      try { localStorage.setItem('hackmate_my_created_profile_ids', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    try {
      localStorage.setItem('hackmate_current_student_id', student.id);
    } catch (e) {}
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  };

  const handleLogout = () => {
    setCurrentStudentId(null);
    try {
      localStorage.removeItem('hackmate_current_student_id');
    } catch (e) {}
  };

  const handleRemoveProfileFromDevice = (idToRemove) => {
    setMyCreatedProfileIds(prev => {
      const updated = prev.filter(id => id !== idToRemove);
      try { localStorage.setItem('hackmate_my_created_profile_ids', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    if (currentStudentId === idToRemove) {
      setCurrentStudentId(null);
      try { localStorage.removeItem('hackmate_current_student_id'); } catch (e) {}
    }
  };

  // Instantiate Disjoint Set Union (DSU)
  const dsu = useMemo(() => {
    const instance = new DisjointSet();
    students.forEach(s => instance.makeSet(s.id));
    teams.forEach(t => {
      if (t.members.length > 1) {
        for (let i = 1; i < t.members.length; i++) {
          instance.union(t.members[0], t.members[i]);
        }
      }
    });
    return instance;
  }, [students, teams]);

  const pendingNotifCount = useMemo(() => {
    if (!currentStudentId) return 0;
    return notifications.filter(n => n.recipientId === currentStudentId && n.status === 'PENDING').length;
  }, [notifications, currentStudentId]);

  const handleRegisterNewStudent = (newStudent) => {
    setStudents(prev => [newStudent, ...prev]);
    setCurrentStudentId(newStudent.id);
    setMyCreatedProfileIds(prev => {
      const updated = prev.includes(newStudent.id) ? prev : [newStudent.id, ...prev];
      try { localStorage.setItem('hackmate_my_created_profile_ids', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    try {
      localStorage.setItem('hackmate_current_student_id', newStudent.id);
    } catch (e) {}
    saveCloudStudent(newStudent);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };


  const handleSaveProfile = (updatedStudent) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    saveCloudStudent(updatedStudent);
  };

  const handleCreateHackathon = (newHackathonData) => {
    saveHostedHackathon(newHackathonData);
    setHackathons(prev => [newHackathonData, ...prev]);
    setIsNewHackathonModalOpen(false);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
  };

  const handleRealTimeSync = async () => {
    setIsRealTimeScanModalOpen(true);
    setIsScanningLive(true);
    setScanReport(null);
    setScanProgress({ stage: 'INIT', message: 'Connecting to global hackathon networks...', percent: 10 });

    try {
      const result = await performRealTimeHackathonScan(hackathons, (progress) => {
        setScanProgress(progress);
      });

      setHackathons(result.activeHackathons);
      setLastSyncedTime(result.timestamp);
      setScanReport(result);

      try {
        localStorage.setItem('hackmate_hackathons', JSON.stringify(result.activeHackathons.slice(0, 200)));
      } catch (e) {
        console.warn('LocalStorage caching skipped:', e);
      }

      if (result.removedCount > 0 || result.addedCount > 0) {
        setAutoSyncAlert(`⚡ Real-Time Scan: Removed ${result.removedCount} ended events • Added ${result.addedCount} newly registered hackathons!`);
        setTimeout(() => setAutoSyncAlert(null), 8000);
      }
    } catch (err) {
      console.error('Real-time scan error:', err);
    } finally {
      setIsScanningLive(false);
    }
  };

  const handleQuickRefresh = async (isSilent = false) => {
    if (!isSilent) setIsRefreshingLive(true);
    try {
      const quickData = await fetchQuickLiveHackathons();
      if (Array.isArray(quickData) && quickData.length > 0) {
        setHackathons(prev => {
          const { activeHackathons, removedCount } = filterAndRefreshHackathons([...quickData, ...prev]);
          const prevMap = new Map(activeHackathons.map(h => [h.id, h]));
          
          if (isSilent && removedCount > 0) {
            console.log(`Auto-pruned ${removedCount} ended hackathons silently.`);
          }
          return Array.from(prevMap.values());
        });
        setLastSyncedTime(new Date());
      }
    } catch (e) {
      console.error('Failed to sync live hackathons:', e);
    } finally {
      if (!isSilent) setIsRefreshingLive(false);
    }
  };

  const handleDeepSyncAll = handleRealTimeSync;

  // Continuous background polling & progressive hydration
  useEffect(() => {
    let isCancelled = false;

    // 1. Immediate fast load (200 items in ~1.5s)
    handleQuickRefresh(true).then(() => {
      if (isCancelled) return;
      // 2. Automatically launch progressive background deep sync for all 1,000+ hackathons!
      handleDeepSyncAll(10);
    });

    // 3. Continuous polling every 60s for new additions
    const pollInterval = setInterval(() => {
      handleQuickRefresh(true);
    }, 60000);

    // 4. Tab visibility sync
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleQuickRefresh(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Supabase Cloud Hydration & Live Realtime Cross-Device Synchronization
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // 1. Initial hydration from cloud database
    getCloudStudents().then(cloudStudents => {
      if (Array.isArray(cloudStudents) && cloudStudents.length > 0) {
        setStudents(cloudStudents);
      }
    });

    getCloudTeams().then(cloudTeams => {
      if (Array.isArray(cloudTeams) && cloudTeams.length > 0) {
        setTeams(cloudTeams);
      }
    });

    getCloudMessages().then(cloudMsgs => {
      if (cloudMsgs && Object.keys(cloudMsgs).length > 0) {
        setTeamMessages(cloudMsgs);
      }
    });

    getCloudNotifications().then(cloudNotifs => {
      if (Array.isArray(cloudNotifs) && cloudNotifs.length > 0) {
        setNotifications(cloudNotifs);
      }
    });

    // 2. Realtime listener pushes changes to all browsers instantly
    const unsubscribe = subscribeToRealtimeChanges({
      onStudentChange: ({ type, student, id }) => {
        if (type === 'DELETE') {
          setStudents(prev => prev.filter(s => s.id !== id));
        } else if (student) {
          setStudents(prev => {
            const exists = prev.some(s => s.id === student.id);
            return exists
              ? prev.map(s => s.id === student.id ? student : s)
              : [student, ...prev];
          });
        }
      },
      onTeamChange: ({ type, team, id }) => {
        if (type === 'DELETE') {
          setTeams(prev => prev.filter(t => t.id !== id));
        } else if (team) {
          setTeams(prev => {
            const exists = prev.some(t => t.id === team.id);
            return exists
              ? prev.map(t => t.id === team.id ? team : t)
              : [team, ...prev];
          });
        }
      },
      onMessageChange: ({ teamId, message }) => {
        if (teamId && message) {
          setTeamMessages(prev => {
            const existing = prev[teamId] || [];
            if (existing.some(m => m.id === message.id)) return prev;
            return {
              ...prev,
              [teamId]: [...existing, message]
            };
          });
        }
      },
      onNotificationChange: ({ type, notification, id }) => {
        if (type === 'DELETE') {
          setNotifications(prev => prev.filter(n => n.id !== id));
        } else if (notification) {
          setNotifications(prev => {
            const exists = prev.some(n => n.id === notification.id);
            return exists
              ? prev.map(n => n.id === notification.id ? notification : n)
              : [notification, ...prev];
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleCreateTeam = (newTeam) => {
    setTeams(prev => [newTeam, ...prev]);
    const welcomeMsg = {
      id: `sys-${Date.now()}`,
      isSystem: true,
      text: `Team "${newTeam.name}" formed! Squad chat activated.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTeamMessages(prev => ({
      ...prev,
      [newTeam.id]: [welcomeMsg]
    }));
    saveCloudTeam(newTeam);
    saveCloudMessage(newTeam.id, welcomeMsg);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  };

  const handleUpdateTeam = (updatedTeam) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    if (activeChatTeam && activeChatTeam.id === updatedTeam.id) {
      setActiveChatTeam(updatedTeam);
    }
    if (registrationPacketTeam && registrationPacketTeam.id === updatedTeam.id) {
      setRegistrationPacketTeam(updatedTeam);
    }
    saveCloudTeam(updatedTeam);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
  };

  const handleOpenRegistrationPacket = (team) => {
    setRegistrationPacketTeam(team);
    setIsRegistrationPacketOpen(true);
  };

  const handleJoinTeam = (teamId, studentId) => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return { success: false, reason: 'Team not found' };

    const alreadyInTeam = teams.find(t =>
      t.hackathonId === targetTeam.hackathonId && t.members.includes(studentId)
    );

    if (alreadyInTeam) {
      return {
        success: false,
        reason: `Union-Find Guard: Student is already in team "${alreadyInTeam.name}" for this hackathon!`
      };
    }

    dsu.union(targetTeam.members[0], studentId);

    const updatedTargetTeam = {
      ...targetTeam,
      members: [...targetTeam.members, studentId]
    };

    setTeams(prev => prev.map(t => t.id === teamId ? updatedTargetTeam : t));
    saveCloudTeam(updatedTargetTeam);

    const joiningStudent = students.find(s => s.id === studentId);
    if (joiningStudent) {
      const joinMsg = {
        id: `sys-${Date.now()}`,
        isSystem: true,
        text: `${joiningStudent.name} joined the squad!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTeamMessages(prev => ({
        ...prev,
        [teamId]: [
          ...(prev[teamId] || []),
          joinMsg
        ]
      }));
      saveCloudMessage(teamId, joinMsg);
    }

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    return { success: true };
  };

  const handleLeaveTeam = (teamId, studentId) => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (targetTeam && targetTeam.leaderId === studentId) {
      // Disband team
      setTeams(prev => prev.filter(t => t.id !== teamId));
      deleteCloudTeam(teamId);
    } else if (targetTeam) {
      const updatedTeam = {
        ...targetTeam,
        members: targetTeam.members.filter(m => m !== studentId)
      };
      setTeams(prev => prev.map(t => t.id === teamId ? updatedTeam : t));
      saveCloudTeam(updatedTeam);
    }
  };

  const handleInviteStudent = (candidateStudent) => {
    if (!currentStudent) {
      setIsOnboardingOpen(true);
      return alert('Please sign up or complete your profile first to send recruitment invites!');
    }

    const myLedTeams = teams.filter(t => t.leaderId === currentStudent.id);

    if (myLedTeams.length === 0) {
      alert("You haven't formed any squads yet! Please switch to the 'Teams' tab and click 'Form New Squad' so you can invite teammates.");
      return;
    }

    // Opens interactive modal asking which squad to invite into (especially when leader has > 1 team)
    setInviteModalCandidate(candidateStudent);
    setIsInviteModalOpen(true);
  };

  const handleConfirmSendInvite = ({ team, candidate, roleOffered, message }) => {
    const hackathon = hackathons.find(h => h.id === team.hackathonId) || { id: team.hackathonId, title: team.hackathonTitle };

    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'RECRUIT_INVITE',
      recipientId: candidate.id,
      senderTeamId: team.id,
      senderTeamName: team.name,
      senderLeaderName: currentStudent.name,
      hackathonId: hackathon.id,
      hackathonTitle: team.hackathonTitle,
      roleOffered: roleOffered || candidate.preferredRole || 'Teammate',
      message: message || `Hi ${candidate.name}, ${currentStudent.name} invited you to join "${team.name}" for ${team.hackathonTitle}!`,
      matchScore: Math.floor(Math.random() * 15) + 85,
      status: 'PENDING',
      timestamp: 'Just now'
    };

    setNotifications(prev => [newNotif, ...prev]);
    saveCloudNotification(newNotif);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    alert(`Squad invitation sent to ${candidate.name} for team "${team.name}"!`);
  };

  const handleSendJoinRequest = (targetTeam, applicantStudent) => {
    const leaderId = targetTeam.leaderId;
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'JOIN_REQUEST',
      recipientId: leaderId,
      senderTeamId: targetTeam.id,
      senderTeamName: targetTeam.name,
      applicantId: applicantStudent.id,
      applicantName: applicantStudent.name,
      hackathonTitle: targetTeam.hackathonTitle,
      message: `${applicantStudent.name} (${applicantStudent.college || 'Engineering'}) requested to join your squad for ${targetTeam.hackathonTitle}.`,
      matchScore: Math.floor(Math.random() * 20) + 80,
      status: 'PENDING',
      timestamp: 'Just now'
    };

    setNotifications(prev => [newNotif, ...prev]);
    saveCloudNotification(newNotif);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
  };

  const handleAcceptInvite = (notif) => {
    const targetUserId = notif.type === 'JOIN_REQUEST' ? notif.applicantId : notif.recipientId;
    const res = handleJoinTeam(notif.senderTeamId, targetUserId);
    if (!res.success) {
      alert(res.reason);
      return;
    }
    const updated = { ...notif, status: 'ACCEPTED' };
    setNotifications(prev => prev.map(n => n.id === notif.id ? updated : n));
    saveCloudNotification(updated);
  };

  const handleDeclineInvite = (notifId) => {
    const target = notifications.find(n => n.id === notifId);
    if (target) {
      const updated = { ...target, status: 'DECLINED' };
      setNotifications(prev => prev.map(n => n.id === notifId ? updated : n));
      saveCloudNotification(updated);
    }
  };

  const handleOpenTeamChat = (team) => {
    setActiveChatTeam(team);
    setIsChatModalOpen(true);
  };

  const handleSendMessage = (teamId, messageObj) => {
    setTeamMessages(prev => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), messageObj]
    }));
    saveCloudMessage(teamId, messageObj);
  };

  const activeStudentProfile = currentStudent || {
    id: 'placeholder',
    name: 'New Student',
    college: 'Your College',
    branch: 'Engineering',
    div: 'Div A',
    title: 'Student Developer',
    preferredRoles: ['Fullstack'],
    preferredRole: 'Fullstack',
    experienceLevel: 'Intermediate',
    availabilityHours: 20,
    pastHackathons: 0,
    bio: 'Please sign up to complete your profile.',
    skills: ['React', 'Python'],
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=newuser'
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentStudent={currentStudent}
        allStudents={students}
        setCurrentStudentId={handleStudentSwitch}
        pendingNotifCount={pendingNotifCount}
        openProfileModal={() => setIsProfileModalOpen(true)}
        openOnboardingModal={() => setIsOnboardingOpen(true)}
        openLoginModal={handleOpenLoginModal}
        onLogout={handleLogout}
      />


      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            hackathons={hackathons}
            currentStudent={currentStudent}
            teams={teams}
            allStudents={students}
            setActiveTab={setActiveTab}
            openNewHackathonModal={() => setIsNewHackathonModalOpen(true)}
            openOnboardingModal={() => setIsOnboardingOpen(true)}
            openLoginModal={() => handleOpenLoginModal('direct')}
            setSelectedHackathonForMatch={setSelectedHackathonForMatch}

            onOpenTeamChat={handleOpenTeamChat}
            onRefreshLiveHackathons={handleRealTimeSync}
            onDeepSyncAll={handleRealTimeSync}
            isRefreshingLive={isScanningLive}
            isDeepSyncing={isScanningLive}
            deepSyncProgress={scanProgress}
            totalUnstop={TOTAL_UNSTOP_OPPORTUNITIES}
            totalDevpost={TOTAL_DEVPOST_OPPORTUNITIES}
            lastSyncedTime={lastSyncedTime}
            autoSyncAlert={autoSyncAlert}
            onDismissSyncAlert={() => setAutoSyncAlert(null)}
          />
        )}

        {(activeTab === 'recruit' || activeTab === 'findTeams' || activeTab === 'discovery') && (
          <Discovery
            students={students}
            currentStudent={currentStudent}
            teams={teams}
            hackathons={hackathons}
            userMode={activeTab === 'findTeams' ? 'OPEN_FOR_TEAM' : 'RECRUITING'}
            selectedHackathonId={selectedHackathonForMatch}
            setSelectedHackathonId={setSelectedHackathonForMatch}
            onInviteStudent={handleInviteStudent}
            onSendJoinRequest={handleSendJoinRequest}
            openLoginModal={() => handleOpenLoginModal('direct')}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsHub
            teams={teams}
            students={students}
            hackathons={hackathons}
            currentStudent={currentStudent}
            onCreateTeam={handleCreateTeam}
            onUpdateTeam={handleUpdateTeam}
            onJoinTeam={handleJoinTeam}
            onLeaveTeam={handleLeaveTeam}
            dsuInstance={dsu}
            onOpenTeamChat={handleOpenTeamChat}
            onSendJoinRequest={handleSendJoinRequest}
            onOpenRegistrationPacket={handleOpenRegistrationPacket}
            onNavigateToFindTeams={() => setActiveTab('findTeams')}
            openLoginModal={() => handleOpenLoginModal('direct')}
          />
        )}


        {activeTab === 'invites' && (
          <NotificationsTab
            notifications={notifications}
            currentStudent={activeStudentProfile}
            teams={teams}
            hackathons={hackathons}
            onAcceptInvite={handleAcceptInvite}
            onDeclineInvite={handleDeclineInvite}
          />
        )}

        {activeTab === 'autoteam' && (
          <AutoTeamGenerator
            students={students}
            hackathons={hackathons}
          />
        )}
      </main>

      {/* Team Chat & Squad Canvas Modal */}
      {activeChatTeam && (
        <TeamChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          team={activeChatTeam}
          currentStudent={activeStudentProfile}
          teamMembers={students.filter(s => activeChatTeam.members.includes(s.id))}
          messages={teamMessages[activeChatTeam.id] || []}
          onSendMessage={handleSendMessage}
          onUpdateTeam={handleUpdateTeam}
          onOpenRegistrationPacket={handleOpenRegistrationPacket}
        />
      )}

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={activeStudentProfile}
        onSave={handleSaveProfile}
        onLogout={handleLogout}
        onSwitchProfile={() => handleOpenLoginModal('picker')}
      />

      {/* Onboarding Registration Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onRegisterSuccess={handleRegisterNewStudent}
        onOpenLogin={() => {
          setIsOnboardingOpen(false);
          handleOpenLoginModal('direct');
        }}
      />

      {/* Device-Isolated Login & Switch Profile Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        allStudents={students}
        myCreatedProfileIds={myCreatedProfileIds}
        currentStudent={currentStudent}
        initialTab={loginModalTab}
        onLoginSuccess={handleLoginSuccess}
        onRemoveProfileFromDevice={handleRemoveProfileFromDevice}
        onOpenSignUp={() => {
          setIsLoginModalOpen(false);
          setIsOnboardingOpen(true);
        }}
      />


      {/* Host Hackathon Modal */}
      <HostHackathonModal
        isOpen={isNewHackathonModalOpen}
        onClose={() => setIsNewHackathonModalOpen(false)}
        onHostSuccess={handleCreateHackathon}
      />

      {/* Choose Squad for Invitation Modal */}
      <InviteToTeamModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteModalCandidate(null);
        }}
        candidate={inviteModalCandidate}
        ledTeams={teams.filter(t => t.leaderId === currentStudent?.id)}
        currentStudent={activeStudentProfile}
        onConfirmInvite={handleConfirmSendInvite}
      />

      {/* 1-Click Squad Registration Packet Modal */}
      {registrationPacketTeam && (
        <SquadRegistrationPacketModal
          isOpen={isRegistrationPacketOpen}
          onClose={() => {
            setIsRegistrationPacketOpen(false);
            setRegistrationPacketTeam(null);
          }}
          team={registrationPacketTeam}
          teamMembers={students.filter(s => registrationPacketTeam.members.includes(s.id))}
          hackathon={hackathons.find(h => h.id === registrationPacketTeam.hackathonId)}
          currentStudent={activeStudentProfile}
          onUpdateStudent={handleSaveProfile}
          onUpdateTeam={handleUpdateTeam}
        />
      )}

      {/* Real-Time Live Multi-Platform Scanner Modal */}
      <RealTimeScanModal
        isOpen={isRealTimeScanModalOpen}
        onClose={() => setIsRealTimeScanModalOpen(false)}
        isScanning={isScanningLive}
        scanProgress={scanProgress}
        scanReport={scanReport}
      />

    </div>
  );
}
