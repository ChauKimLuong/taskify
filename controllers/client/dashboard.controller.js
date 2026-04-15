const prisma = require('../../config/prisma');

// [GET] /dashboard
exports.dashboard = async (req, res) => {
  try {
    const userId = res.locals.user.id;

    // Get all projects where user is a member
    const memberships = await prisma.project_members.findMany({
      where: { user_id: userId },
      include: {
        project: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, full_name: true, email: true, avatar_url: true },
                },
              },
            },
            tasks: {
              select: { id: true, status: true },
            },
          },
        },
      },
      orderBy: { joined_at: 'desc' },
    });

    const projects = memberships.map((m) => {
      const totalTasks = m.project.tasks.length;
      const doneTasks = m.project.tasks.filter((t) => t.status === 'done').length;
      return {
        ...m.project,
        role: m.project_role,
        totalTasks,
        doneTasks,
        progress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      };
    });

    res.render('client/pages/dashboard/index', {
      title: 'Dashboard',
      user: res.locals.user,
      projects,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
