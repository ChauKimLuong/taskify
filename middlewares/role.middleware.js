const { normalizeRole } = require('../helpers/role.helper');

const requireRole = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  return (req, res, next) => {
    const userRole = normalizeRole(res.locals.user?.role);

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.redirect('/');
    }

    next();
  };
};

module.exports = requireRole;
