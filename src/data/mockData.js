export const COLUMNS = ["Backlog","To Do","In Progress","Blocked","Review","Done"];
export const WIP_LIMIT = 3; // applies only to "In Progress"

export const INITIAL_TASKS = [
  {id:"t1", title:"Plan monthly workflow review",                  assignee:"Gege", priority:"Medium", column:"Backlog", meetingRequest: null, description: ""},
  {id:"t2", title:"Prepare quarterly productivity report",         assignee:"Edda", priority:"Medium", column:"Backlog", meetingRequest: null, description: ""},
  {id:"t3", title:"Update onboarding process documentation",       assignee:"Gege", priority:"Low",    column:"Backlog", meetingRequest: null, description: ""},
  {id:"t4", title:"Update task assignments for the week",          assignee:"Edda", priority:"High",   column:"To Do", meetingRequest: null, description: ""},
  {id:"t5", title:"Organize weekly team meeting agenda",           assignee:"Gege", priority:"High",   column:"To Do", meetingRequest: null, description: ""},
  {id:"t6", title:"Review current project priorities",             assignee:"Edda", priority:"High",   column:"To Do", meetingRequest: null, description: ""},
  {id:"t7", title:"Prepare client progress presentation",          assignee:"Gege", priority:"Medium", column:"In Progress", meetingRequest: null, description: ""},
  {id:"t8", title:"Analyze workflow interruptions affecting productivity", assignee:"Edda", priority:"Low",    column:"In Progress", meetingRequest: null, description: ""},
  {id:"t9", title:"Waiting for client feedback on proposal",       assignee:"Gege", priority:"High",   column:"Blocked", meetingRequest: null, description: ""},
  {id:"t10", title:"Missing data for weekly report",               assignee:"Edda", priority:"High",   column:"Blocked", meetingRequest: null, description: ""},
  {id:"t11", title:"Review client presentation before submission", assignee:"Gege", priority:"High",   column:"Review", meetingRequest: null, description: ""},
  {id:"t12", title:"Submit monthly productivity report",           assignee:"Edda", priority:"Medium", column:"Done", meetingRequest: null, description: ""},
  {id:"t13", title:"Finalize client meeting agenda",               assignee:"Gege", priority:"High",   column:"Done", meetingRequest: null, description: ""},
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
  { id:"u1", name:"Alex Morgan",   email:"alex@mo.io",  password:"admin123",  role:ROLES.ADMIN,       teamId:"team1", avatar:"AM" },
  { id:"u2", name:"Gege Dobruna",  email:"gege@mo.io",  password:"lead123",   role:ROLES.TEAM_LEAD,   teamId:"team1", avatar:"GD" },
  { id:"u3", name:"Sara Chen",     email:"sara@mo.io",  password:"lead456",   role:ROLES.TEAM_LEAD,   teamId:"team2", avatar:"SC" },
  { id:"u4", name:"Edda Smith",    email:"edda@mo.io",  password:"member123", role:ROLES.TEAM_MEMBER, teamId:"team1", avatar:"ES" },
  { id:"u5", name:"Marco Rivera",  email:"marco@mo.io", password:"member456", role:ROLES.TEAM_MEMBER, teamId:"team1", avatar:"MR" },
  { id:"u6", name:"Priya Patel",   email:"priya@mo.io", password:"member789", role:ROLES.TEAM_MEMBER, teamId:"team2", avatar:"PP" },
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
