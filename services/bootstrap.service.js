const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { AVAILABLE_ROLES } = require('../helpers/role.helper');

const DEFAULT_PM_EMAIL = process.env.INITIAL_PM_EMAIL || 'pm@taskify.local';
const DEFAULT_PM_PASSWORD = process.env.INITIAL_PM_PASSWORD || 'Pm@123456';
const DEFAULT_PM_NAME = process.env.INITIAL_PM_NAME || 'Project Manager';

const ensureProjectManagerAccount = async () => {
  const projectManager = await prisma.users.findFirst({
    where: { role: AVAILABLE_ROLES.PROJECT_MANAGER },
  });

  if (projectManager) {
    return projectManager;
  }

  const existingUser = await prisma.users.findUnique({
    where: { email: DEFAULT_PM_EMAIL },
  });

  if (existingUser) {
    return prisma.users.update({
      where: { id: existingUser.id },
      data: {
        role: AVAILABLE_ROLES.PROJECT_MANAGER,
        full_name: existingUser.full_name || DEFAULT_PM_NAME,
      },
    });
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PM_PASSWORD, 10);

  const newProjectManager = await prisma.users.create({
    data: {
      email: DEFAULT_PM_EMAIL,
      password: hashedPassword,
      full_name: DEFAULT_PM_NAME,
      role: AVAILABLE_ROLES.PROJECT_MANAGER,
    },
  });

  console.log('Bootstrapped default Project Manager account:', {
    email: DEFAULT_PM_EMAIL,
    password: DEFAULT_PM_PASSWORD,
  });

  return newProjectManager;
};

module.exports = {
  ensureProjectManagerAccount,
};
