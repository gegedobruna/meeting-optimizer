export const COLUMNS = ["Backlog","To Do","In Progress","Blocked","Review","Done"];
export const WIP_LIMIT = 3; // applies only to "In Progress"

// NOTE: If the board looks empty after this update, open DevTools →
// Application → Local Storage → delete the "kanban_tasks" key, then hard-refresh.
// Stale tasks stored before this migration still carry the old `assignee` string field.
export const INITIAL_TASKS = [
  {id:"t1",  title:"Plan monthly workflow review",                        assignedUserIds:["u2"], priority:"Medium", column:"Backlog",      meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t2",  title:"Prepare quarterly productivity report",               assignedUserIds:["u4"], priority:"Medium", column:"Backlog",      meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t3",  title:"Update onboarding process documentation",             assignedUserIds:["u2"], priority:"Low",    column:"Backlog",      meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t4",  title:"Update task assignments for the week",                assignedUserIds:["u4"], priority:"High",   column:"To Do",        meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t5",  title:"Organize weekly team meeting agenda",                 assignedUserIds:["u2"], priority:"High",   column:"To Do",        meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t6",  title:"Review current project priorities",                   assignedUserIds:["u4"], priority:"High",   column:"To Do",        meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t7",  title:"Prepare client progress presentation",                assignedUserIds:["u2"], priority:"Medium", column:"In Progress",  meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t8",  title:"Analyze workflow interruptions affecting productivity",assignedUserIds:["u4"], priority:"Low",    column:"In Progress",  meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t9",  title:"Waiting for client feedback on proposal",             assignedUserIds:["u2"], priority:"High",   column:"Blocked",      meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t10", title:"Missing data for weekly report",                      assignedUserIds:["u4"], priority:"High",   column:"Blocked",      meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t11", title:"Review client presentation before submission",        assignedUserIds:["u2"], priority:"High",   column:"Review",       meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t12", title:"Submit monthly productivity report",                  assignedUserIds:["u4"], priority:"Medium", column:"Done",         meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
  {id:"t13", title:"Finalize client meeting agenda",                      assignedUserIds:["u2"], priority:"High",   column:"Done",         meetingRequest:null, description:"", blockedSince:null, dueDate:null, fromMeeting:false},
];

export const AGENDA_ITEMS = [
  {id:"a1", topic:"Sprint blockers",       owner:"Gege",   minutes:10},
  {id:"a2", topic:"API status update",     owner:"Edda",   minutes:5},
  {id:"a3", topic:"QA handoff process",    owner:"Gege",   minutes:10},
  {id:"a4", topic:"Demo prep",             owner:"Edda",   minutes:5},
];

export const ROLES = {
  ADMIN:       "ADMIN",
  TEAM_LEAD:   "TEAM_LEAD",
  TEAM_MEMBER: "TEAM_MEMBER",
};

export const USERS = [
  { id:"u1", name:"Alex Morgan",   email:"alex@mo.io",  password:"admin123",  role:ROLES.ADMIN,       teamId:"team1", avatar:"AM", title:"Engineering Manager",  department:"Engineering" },
  { id:"u2", name:"Gege Dobruna",  email:"gege@mo.io",  password:"lead123",   role:ROLES.TEAM_LEAD,   teamId:"team1", avatar:"GD", title:"Team Lead",            department:"Engineering" },
  { id:"u3", name:"Sara Chen",     email:"sara@mo.io",  password:"lead456",   role:ROLES.TEAM_LEAD,   teamId:"team2", avatar:"SC", title:"Product Lead",         department:"Product"     },
  { id:"u4", name:"Edda Smith",    email:"edda@mo.io",  password:"member123", role:ROLES.TEAM_MEMBER, teamId:"team1", avatar:"ES", title:"Senior Developer",     department:"Engineering" },
  { id:"u5", name:"Marco Rivera",  email:"marco@mo.io", password:"member456", role:ROLES.TEAM_MEMBER, teamId:"team1", avatar:"MR", title:"Frontend Developer",   department:"Engineering" },
  { id:"u6", name:"Priya Patel",   email:"priya@mo.io", password:"member789", role:ROLES.TEAM_MEMBER, teamId:"team2", avatar:"PP", title:"QA Engineer",          department:"Design"      },
];

export const TEAMS = [
  { id:"team1", name:"Alpha Team", leadId:"u2", memberIds:["u1","u2","u4","u5"] },
  { id:"team2", name:"Beta Team",  leadId:"u3", memberIds:["u3","u6"] },
];

export const NAV_ITEMS = [
  { label:"Dashboard",        page:"dashboard",         roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"Board",            page:"board",             roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"My Tasks",         page:"my-tasks",          roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"Meeting Requests", page:"meeting-requests",  roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"Meeting Notes",    page:"meeting-notes",     roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"Calendar",         page:"calendar",          roles:[ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER] },
  { label:"Teams",            page:"teams",             roles:[ROLES.ADMIN, ROLES.TEAM_LEAD] },
  { label:"Analytics",        page:"analytics",         roles:[ROLES.ADMIN, ROLES.TEAM_LEAD] },
];
