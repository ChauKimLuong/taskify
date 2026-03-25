const { getDashboardPathByRole } = require('../../helpers/role.helper');
const prisma = require('../../config/prisma');
const { AVAILABLE_ROLES, normalizeRole } = require('../../helpers/role.helper');

exports.index = (req, res) => {
  return res.redirect(getDashboardPathByRole(res.locals.user?.role));
};

exports.projectManagerDashboard = async (req, res) => {
  const users = await prisma.users.findMany({
    orderBy: [
      { created_at: 'desc' },
      { id: 'desc' },
    ],
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      created_at: true,
    },
  });

  res.render('client/pages/dashboard/project-manager', {
    title: 'Project Manager Dashboard',
    roleUpdateStatus: req.query.roleUpdate || '',
    users: users.map((user) => ({
      ...user,
      normalizedRole: normalizeRole(user.role),
      canEditRole: normalizeRole(user.role) !== AVAILABLE_ROLES.PROJECT_MANAGER,
    })),
    roleOptions: [
      AVAILABLE_ROLES.TEAM_LEADER,
      AVAILABLE_ROLES.MEMBER,
    ],
  });
};

exports.teamLeaderDashboard = (req, res) => {
  res.render('client/pages/dashboard/team-leader', {
    title: 'Team Leader Dashboard',
  });
};

exports.memberKanban = (req, res) => {
  res.render('client/pages/dashboard/member-kanban', {
    title: 'Member Kanban',
  });
};
