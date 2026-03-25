const AVAILABLE_ROLES = {
  PROJECT_MANAGER: 'project_manager',
  TEAM_LEADER: 'team_leader',
  MEMBER: 'member',
};

const ROLE_ALIASES = {
  projectmanager: AVAILABLE_ROLES.PROJECT_MANAGER,
  project_manager: AVAILABLE_ROLES.PROJECT_MANAGER,
  project_managers: AVAILABLE_ROLES.PROJECT_MANAGER,
  pm: AVAILABLE_ROLES.PROJECT_MANAGER,
  teamleader: AVAILABLE_ROLES.TEAM_LEADER,
  team_leader: AVAILABLE_ROLES.TEAM_LEADER,
  leader: AVAILABLE_ROLES.TEAM_LEADER,
  tl: AVAILABLE_ROLES.TEAM_LEADER,
  member: AVAILABLE_ROLES.MEMBER,
  user: AVAILABLE_ROLES.MEMBER,
};

const ROLE_DASHBOARD_PATHS = {
  [AVAILABLE_ROLES.PROJECT_MANAGER]: '/pm/dashboard',
  [AVAILABLE_ROLES.TEAM_LEADER]: '/team-leader/dashboard',
  [AVAILABLE_ROLES.MEMBER]: '/member/kanban',
};

const normalizeRole = (role) => {
  const normalizedRole = String(role || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  const aliasKey = normalizedRole.replace(/_/g, '');

  return ROLE_ALIASES[normalizedRole] || ROLE_ALIASES[aliasKey] || normalizedRole;
};

const getDashboardPathByRole = (role) => {
  const normalizedRole = normalizeRole(role);
  return ROLE_DASHBOARD_PATHS[normalizedRole] || ROLE_DASHBOARD_PATHS.member;
};

module.exports = {
  AVAILABLE_ROLES,
  ROLE_DASHBOARD_PATHS,
  normalizeRole,
  getDashboardPathByRole,
};
