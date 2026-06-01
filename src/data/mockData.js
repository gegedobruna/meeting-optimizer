export const COLUMNS = ["Backlog","To Do","In Progress","Blocked","Review","Done"];
export const WIP_LIMIT = 3; // applies only to "In Progress"

export const ROLES = {
  ADMIN:       "ADMIN",
  TEAM_LEAD:   "TEAM_LEAD",
  TEAM_MEMBER: "TEAM_MEMBER",
};

// NOTE: After this roster change, clear localStorage "kanban_tasks" and
// "mo_current_user" keys in DevTools → Application → Local Storage, then hard-refresh.
export const USERS = [
  { id:"u1", name:"John Doe",       role:ROLES.TEAM_MEMBER, teamId:"team1", avatar:"JD", title:"Frontend Developer",  department:"Engineering" },
  { id:"u2", name:"Mark Wilson",    role:ROLES.TEAM_LEAD,   teamId:"team1", avatar:"MW", title:"Engineering Lead",    department:"Engineering" },
  { id:"u3", name:"Sarah Johnson",  role:ROLES.ADMIN,       teamId:"team1", avatar:"SJ", title:"Engineering Manager", department:"Engineering" },
  { id:"u4", name:"Emma Smith",     role:ROLES.TEAM_MEMBER, teamId:"team1", avatar:"ES", title:"Backend Developer",   department:"Engineering" },
  { id:"u5", name:"Kevin White",    role:ROLES.TEAM_MEMBER, teamId:"team2", avatar:"KW", title:"UI/UX Designer",      department:"Design"      },
  { id:"u6", name:"Lisa Green",     role:ROLES.TEAM_LEAD,   teamId:"team2", avatar:"LG", title:"Design Lead",         department:"Design"      },
  { id:"u7", name:"Michael Brown",  role:ROLES.TEAM_MEMBER, teamId:"team2", avatar:"MB", title:"QA Engineer",         department:"QA"          },
];

export const TEAMS = [
  { id:"team1", name:"Development Team", leadId:"u2", memberIds:["u1","u2","u3","u4"] },
  { id:"team2", name:"Design Team",      leadId:"u6", memberIds:["u5","u6","u7"] },
];

// NOTE: Clear "kanban_tasks" from localStorage after any INITIAL_TASKS change.
export const INITIAL_TASKS = [
  {id:"t1",  title:"Plan monthly workflow review",                         assignedUserIds:["u1"], priority:"Medium", column:"Backlog",     meetingRequest:null, description:"Review current workflows and identify bottlenecks.", blockedSince:null, dueDate:null,                    fromMeeting:false},
  {id:"t2",  title:"Prepare quarterly productivity report",                assignedUserIds:["u4"], priority:"Medium", column:"Backlog",     meetingRequest:null, description:"Compile metrics from all teams for Q2.",             blockedSince:null, dueDate:null,                    fromMeeting:false},
  {id:"t3",  title:"Update onboarding process documentation",              assignedUserIds:["u1"], priority:"Low",    column:"Backlog",     meetingRequest:null, description:"Revise onboarding docs to reflect new tooling.",     blockedSince:null, dueDate:null,                    fromMeeting:false},
  {id:"t4",  title:"Update task assignments for the week",                 assignedUserIds:["u4"], priority:"High",   column:"To Do",      meetingRequest:null, description:"Reassign overdue tasks and balance team workload.",   blockedSince:null, dueDate:null,                    fromMeeting:false},
  {id:"t5",  title:"Organize weekly team meeting agenda",                  assignedUserIds:["u2"], priority:"High",   column:"To Do",      meetingRequest:null, description:"Draft agenda items and share with the team.",         blockedSince:null, dueDate:null,                    fromMeeting:false},
  {id:"t6",  title:"Review current project priorities",                    assignedUserIds:["u1"], priority:"High",   column:"To Do",      meetingRequest:null, description:"Align priorities with stakeholder feedback.",         blockedSince:null, dueDate:"2026-06-08T00:00:00.000Z", fromMeeting:false},
  {id:"t7",  title:"Prepare client progress presentation",                 assignedUserIds:["u1"], priority:"Medium", column:"In Progress",meetingRequest:null, description:"Summarize sprint progress for the client review.",    blockedSince:null, dueDate:"2026-06-10T00:00:00.000Z", fromMeeting:false},
  {id:"t8",  title:"Analyze workflow interruptions affecting productivity", assignedUserIds:["u4"], priority:"Low",    column:"In Progress",meetingRequest:null, description:"Map interruption patterns and identify root causes.",  blockedSince:null, dueDate:null,                    fromMeeting:false},
  {id:"t9",  title:"Waiting for client feedback on proposal",              assignedUserIds:["u2"], priority:"High",   column:"Blocked",    meetingRequest:null, description:"Cannot proceed until client reviews the proposal.",   blockedSince:null, dueDate:null,                    fromMeeting:false},
  {id:"t10", title:"Missing data for weekly report",                       assignedUserIds:["u4"], priority:"High",   column:"Blocked",    meetingRequest:null, description:"Data pipeline failure blocking report generation.",    blockedSince:null, dueDate:null,                    fromMeeting:false},
  {id:"t11", title:"Prepare client workflow analysis",                     assignedUserIds:["u2"], priority:"High",   column:"Review",     meetingRequest:null, description:"Map current meeting patterns and identify savings.",   blockedSince:null, dueDate:"2026-06-08T00:00:00.000Z", fromMeeting:false},
  {id:"t12", title:"Submit monthly productivity report",                   assignedUserIds:["u4"], priority:"Medium", column:"Done",       meetingRequest:null, description:"Finalize and submit the monthly metrics report.",     blockedSince:null, dueDate:null,                    fromMeeting:false},
  {id:"t13", title:"Finalize client meeting agenda",                       assignedUserIds:["u1"], priority:"High",   column:"Done",       meetingRequest:null, description:"Confirm agenda items and distribute to attendees.",   blockedSince:null, dueDate:null,                    fromMeeting:false},
];

export const NAV_ITEMS = [
  { label:"Dashboard",        icon:"⊞", page:"dashboard",         roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"Team Board",       icon:"▦", page:"board",             roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"My Tasks",         icon:"✓", page:"my-tasks",          roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"Calendar",         icon:"📅", page:"calendar",          roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"Teams",            icon:"👥", page:"teams",             roles:[ROLES.ADMIN, ROLES.TEAM_LEAD] },
  { label:"Meeting Requests", icon:"💬", page:"meeting-requests",  roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"Meeting Notes",    icon:"📝", page:"meeting-notes",     roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"Analytics",        icon:"📊", page:"analytics",         roles:[ROLES.ADMIN, ROLES.TEAM_LEAD] },
];
