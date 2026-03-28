const prisma = require('../config/prisma');
const { PROJECT_ROLES } = require('../helpers/role.helper');

/**
 * Middleware: check system_role (admin / user)
 */
const requireSystemRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = res.locals.user?.system_role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).render('client/pages/errors/403', { title: 'Forbidden' });
    }
    next();
  };
};

/**
 * Middleware: check project_role (team_leader / member)
 * Expects req.params.id as project_id
 */
const requireProjectRole = (...allowedRoles) => {
  return async (req, res, next) => {
    const projectId = Number(req.params.id);
    const userId = res.locals.user?.id;

    if (!projectId || !userId) {
      return res.status(403).render('client/pages/errors/403', { title: 'Forbidden' });
    }

    const membership = await prisma.project_members.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
    });

    if (!membership || !allowedRoles.includes(membership.project_role)) {
      return res.status(403).render('client/pages/errors/403', { title: 'Forbidden' });
    }

    res.locals.membership = membership;
    next();
  };
};

/**
 * Middleware: check if user is a member of the project (any role)
 */
const requireProjectMember = async (req, res, next) => {
  const projectId = Number(req.params.id);
  const userId = res.locals.user?.id;

  if (!projectId || !userId) {
    return res.status(403).render('client/pages/errors/403', { title: 'Forbidden' });
  }

  const membership = await prisma.project_members.findUnique({
    where: {
      project_id_user_id: {
        project_id: projectId,
        user_id: userId,
      },
    },
  });

  if (!membership) {
    return res.status(403).render('client/pages/errors/403', { title: 'Forbidden' });
  }

  res.locals.membership = membership;
  next();
};

module.exports = {
  requireSystemRole,
  requireProjectRole,
  requireProjectMember,
};
