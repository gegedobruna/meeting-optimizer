export const COLUMNS = ["Backlog", "To Do", "In Progress", "Blocked", "Review", "Done"];
export const WIP_LIMIT = 3;         // column-level advisory (In Progress column total)
export const WORKER_WIP_LIMIT = 2;  // per-person max In Progress tasks

export const ROLES = {
  ADMIN:       "ADMIN",
  TEAM_LEAD:   "TEAM_LEAD",
  TEAM_MEMBER: "TEAM_MEMBER",
};

// IMPORTANT: After this roster change, clear localStorage keys
// "kanban_tasks" and "mo_current_user" in DevTools → Application → Local Storage,
// then hard-refresh (Ctrl+Shift+R).

export const USERS = [
  // GLOBAL ADMIN (no team assignment)
  { id: "u0",  name: "Michael Brown",     title: "Director of Operations",        department: "Management",  role: ROLES.ADMIN,       teamId: null,         avatar: "MB" },

  // TEAM 1 — ENGINEERING (5 members)
  { id: "u1",  name: "Sarah Johnson",     title: "Engineering Team Lead",          department: "Engineering", role: ROLES.TEAM_LEAD,   teamId: "team-eng",   avatar: "SJ" },
  { id: "u2",  name: "John Doe",          title: "Senior Frontend Developer",      department: "Engineering", role: ROLES.TEAM_MEMBER, teamId: "team-eng",   avatar: "JD" },
  { id: "u3",  name: "Mark Wilson",       title: "Backend Systems Engineer",       department: "Engineering", role: ROLES.TEAM_MEMBER, teamId: "team-eng",   avatar: "MW" },
  { id: "u4",  name: "Elena Rostova",     title: "DevOps Infrastructure Engineer", department: "Engineering", role: ROLES.TEAM_MEMBER, teamId: "team-eng",   avatar: "ER" },
  { id: "u5",  name: "David Kim",         title: "Fullstack Developer",            department: "Engineering", role: ROLES.TEAM_MEMBER, teamId: "team-eng",   avatar: "DK" },

  // TEAM 2 — PRODUCT MANAGEMENT (4 members)
  { id: "u6",  name: "Alex Morgan",       title: "Principal Product Manager",      department: "Product",     role: ROLES.TEAM_LEAD,   teamId: "team-prod",  avatar: "AM" },
  { id: "u7",  name: "Chloe Bennett",     title: "Technical Product Manager",      department: "Product",     role: ROLES.TEAM_MEMBER, teamId: "team-prod",  avatar: "CB" },
  { id: "u8",  name: "James Southerland", title: "Product Operations Analyst",     department: "Product",     role: ROLES.TEAM_MEMBER, teamId: "team-prod",  avatar: "JS" },
  { id: "u9",  name: "Nisha Patel",       title: "Associate Product Manager",      department: "Product",     role: ROLES.TEAM_MEMBER, teamId: "team-prod",  avatar: "NP" },

  // TEAM 3 — PRODUCT DESIGN (4 members)
  { id: "u10", name: "Sophia Martinez",   title: "Design Director",                department: "Design",      role: ROLES.TEAM_LEAD,   teamId: "team-design", avatar: "SM" },
  { id: "u11", name: "Lucas Vance",       title: "Senior UI/UX Designer",          department: "Design",      role: ROLES.TEAM_MEMBER, teamId: "team-design", avatar: "LV" },
  { id: "u12", name: "Emma Smith",        title: "Interaction Designer",           department: "Design",      role: ROLES.TEAM_MEMBER, teamId: "team-design", avatar: "ES" },
  { id: "u13", name: "Oliver Wright",     title: "Visual & Brand Designer",        department: "Design",      role: ROLES.TEAM_MEMBER, teamId: "team-design", avatar: "OW" },

  // TEAM 4 — CUSTOMER SUCCESS & QA (4 members)
  { id: "u14", name: "Marcus Vance",      title: "Head of Customer Success",       department: "Support",     role: ROLES.TEAM_LEAD,   teamId: "team-cs",    avatar: "MV" },
  { id: "u15", name: "Kevin White",       title: "QA Automation Lead",             department: "Support",     role: ROLES.TEAM_MEMBER, teamId: "team-cs",    avatar: "KW" },
  { id: "u16", name: "Lisa Green",        title: "Enterprise Success Manager",     department: "Support",     role: ROLES.TEAM_MEMBER, teamId: "team-cs",    avatar: "LG" },
  { id: "u17", name: "Tariq Ali",         title: "Technical Support Specialist",   department: "Support",     role: ROLES.TEAM_MEMBER, teamId: "team-cs",    avatar: "TA" },
];

export const TEAMS = [
  { id: "team-eng",    name: "Engineering Team",        leadId: "u1",  memberIds: ["u1", "u2", "u3", "u4", "u5"] },
  { id: "team-prod",   name: "Product Management",      leadId: "u6",  memberIds: ["u6", "u7", "u8", "u9"] },
  { id: "team-design", name: "Product Design",          leadId: "u10", memberIds: ["u10", "u11", "u12", "u13"] },
  { id: "team-cs",     name: "Customer Success & QA",   leadId: "u14", memberIds: ["u14", "u15", "u16", "u17"] },
];

// Blocker timestamps relative to baseline: June 1, 2026 18:00 UTC
// ~12h ago : 2026-06-01T06:00:00.000Z
// ~24h ago : 2026-05-31T18:00:00.000Z
// ~52h ago : 2026-05-30T14:00:00.000Z  (exceeds 48h — escalation ring)
// ~80h ago : 2026-05-29T10:00:00.000Z  (exceeds 72h — manager escalation)

export const INITIAL_TASKS = [
  // ── TASK A — In Progress, multi-assigned, overloaded workload scenario ──────
  {
    id: "t1",
    title: "Migrate authentication service to OAuth 2.0",
    description: "Replace the legacy session-based auth with an OAuth 2.0 provider. Covers frontend token handling and backend service integration.",
    assignedUserIds: ["u2", "u3"],
    priority: "High",
    column: "In Progress",
    meetingRequest: null,
    blockedSince: null,
    dueDate: "2026-06-10T00:00:00.000Z",
    fromMeeting: false,
  },

  // ── TASK B — Blocked 52h, no meeting request ─────────────────────────────
  {
    id: "t2",
    title: "Configure CI/CD pipeline for staging environment",
    description: "Set up automated build, test, and deploy pipeline targeting the staging cluster. Blocked on missing cloud credentials from IT.",
    assignedUserIds: ["u4"],
    priority: "Urgent",
    column: "Blocked",
    meetingRequest: null,
    blockedSince: "2026-05-30T14:00:00.000Z",
    dueDate: "2026-06-05T00:00:00.000Z",
    fromMeeting: false,
  },

  // ── TASK C — Blocked 12h, meeting request present ────────────────────────
  {
    id: "t3",
    title: "Redesign onboarding flow screens",
    description: "Revamp the 5-step onboarding experience based on usability study feedback. Blocked pending sign-off on new IA from Product.",
    assignedUserIds: ["u11"],
    priority: "High",
    column: "Blocked",
    meetingRequest: { title: "Design sync: onboarding blockers", requestedAt: "2026-06-01T08:00:00.000Z" },
    blockedSince: "2026-06-01T06:00:00.000Z",
    dueDate: "2026-06-08T00:00:00.000Z",
    fromMeeting: false,
  },

  // ── TASK D — Review, created from meeting notes ───────────────────────────
  {
    id: "t4",
    title: "Execute regression test suite for v2.4 release",
    description: "Run full automated + manual regression coverage against v2.4 release candidate. Action item from QA planning meeting.",
    assignedUserIds: ["u15"],
    priority: "High",
    column: "Review",
    meetingRequest: null,
    blockedSince: null,
    dueDate: "2026-06-03T00:00:00.000Z",
    fromMeeting: true,
  },

  // ── TASK E — Backlog, unassigned ─────────────────────────────────────────
  {
    id: "t5",
    title: "Define Q3 product roadmap milestones",
    description: "Collaborate with stakeholders to establish and prioritise Q3 feature milestones. Awaiting leadership input before assignment.",
    assignedUserIds: [],
    priority: "Medium",
    column: "Backlog",
    meetingRequest: null,
    blockedSince: null,
    dueDate: "2026-06-15T00:00:00.000Z",
    fromMeeting: false,
  },

  // ── TASK F — Product team, To Do ─────────────────────────────────────────
  {
    id: "t6",
    title: "Document API integration requirements for partner portal",
    description: "Capture all API contract requirements needed by the partner integration team. Coordinate with Engineering for endpoint specs.",
    assignedUserIds: ["u7"],
    priority: "Medium",
    column: "To Do",
    meetingRequest: null,
    blockedSince: null,
    dueDate: "2026-06-12T00:00:00.000Z",
    fromMeeting: false,
  },

  // ── TASK G — Design team, In Progress ────────────────────────────────────
  {
    id: "t7",
    title: "Build component library for design system v2",
    description: "Develop and document a shared Figma component library aligned to the new design system tokens and brand guidelines.",
    assignedUserIds: ["u12"],
    priority: "High",
    column: "In Progress",
    meetingRequest: null,
    blockedSince: null,
    dueDate: "2026-06-20T00:00:00.000Z",
    fromMeeting: false,
  },

  // ── TASK H — Customer Success, Backlog ───────────────────────────────────
  {
    id: "t8",
    title: "Prepare quarterly enterprise client health report",
    description: "Aggregate usage metrics, support ticket trends, and NPS scores for all enterprise accounts to present at the Q2 review.",
    assignedUserIds: ["u16"],
    priority: "Low",
    column: "Backlog",
    meetingRequest: null,
    blockedSince: null,
    dueDate: "2026-06-28T00:00:00.000Z",
    fromMeeting: false,
  },

  // ── TASK I — Cross-team (Engineering + Product), To Do ───────────────────
  {
    id: "t9",
    title: "Build analytics dashboard MVP",
    description: "Deliver a first-pass internal analytics dashboard covering key product usage metrics. Joint effort between Engineering and Product.",
    assignedUserIds: ["u5", "u9"],
    priority: "High",
    column: "To Do",
    meetingRequest: null,
    blockedSince: null,
    dueDate: "2026-06-18T00:00:00.000Z",
    fromMeeting: false,
  },

  // ── BONUS — 80h escalation scenario (Engineering lead) ───────────────────
  {
    id: "t10",
    title: "Resolve production memory leak in billing service",
    description: "Intermittent OOM crashes detected on the billing microservice under peak load. Root cause analysis ongoing.",
    assignedUserIds: ["u1"],
    priority: "Urgent",
    column: "Blocked",
    meetingRequest: null,
    blockedSince: "2026-05-29T10:00:00.000Z",
    dueDate: "2026-06-02T00:00:00.000Z",
    fromMeeting: false,
  },
];

export const NAV_ITEMS = [
  { label: "Dashboard",        icon: "⊞", page: "dashboard",        roles: [ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label: "Team Board",       icon: "▦", page: "board",            roles: [ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label: "My Tasks",         icon: "✓", page: "my-tasks",         roles: [ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label: "Calendar",         icon: "📅", page: "calendar",         roles: [ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label: "Teams",            icon: "👥", page: "teams",            roles: [ROLES.ADMIN, ROLES.TEAM_LEAD] },
  { label: "Meeting Requests", icon: "💬", page: "meeting-requests", roles: [ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label: "Meeting Notes",    icon: "📝", page: "meeting-notes",    roles: [ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label: "Analytics",        icon: "📊", page: "analytics",        roles: [ROLES.ADMIN, ROLES.TEAM_LEAD] },
];
