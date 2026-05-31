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
