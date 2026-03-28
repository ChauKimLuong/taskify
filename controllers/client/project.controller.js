const prisma = require('../../config/prisma');
const { PROJECT_ROLES } = require('../../helpers/role.helper');

// [GET] /projects/create
exports.getCreate = (req, res) => {
  res.render('client/pages/project/create', {
    title: 'Create Project',
    user: res.locals.user,
  });
};

// [POST] /projects/create
exports.postCreate = async (req, res) => {
  try {
    const { project_name, description } = req.body;
    const userId = res.locals.user.id;

    const project = await prisma.projects.create({
      data: {
        project_name,
        description: description || null,
        created_by: userId,
        members: {
          create: {
            user_id: userId,
            project_role: PROJECT_ROLES.TEAM_LEADER,
          },
        },
      },
    });

    res.redirect(`/projects/${project.id}`);
  } catch (error) {
    console.error('Create project error:', error);
    res.redirect('/dashboard?error=create_failed');
  }
};

// [GET] /projects/:id — Kanban board
exports.getProject = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const userId = res.locals.user.id;

    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, full_name: true, email: true, avatar_url: true },
            },
          },
        },
        tasks: {
          include: {
            assignees: {
              include: {
                user: {
                  select: { id: true, full_name: true, email: true, avatar_url: true },
                },
              },
            },
            comments: {
              select: { id: true },
            },
          },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!project) {
      return res.status(404).render('client/pages/errors/404', { title: 'Not Found' });
    }

    // Group tasks by status
    const columns = {
      todo: project.tasks.filter((t) => t.status === 'todo'),
      doing: project.tasks.filter((t) => t.status === 'doing'),
      review: project.tasks.filter((t) => t.status === 'review'),
      done: project.tasks.filter((t) => t.status === 'done'),
    };

    res.render('client/pages/project/board', {
      title: project.project_name,
      user: res.locals.user,
      project,
      columns,
      membership: res.locals.membership,
      isTeamLeader: res.locals.membership.project_role === PROJECT_ROLES.TEAM_LEADER,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// [POST] /projects/:id/members — Add member
exports.addMember = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const { email } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || user.is_deleted) {
      return res.redirect(`/projects/${projectId}?error=user_not_found`);
    }

    // Check if already a member
    const existing = await prisma.project_members.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: user.id,
        },
      },
    });

    if (existing) {
      return res.redirect(`/projects/${projectId}?error=already_member`);
    }

    await prisma.project_members.create({
      data: {
        project_id: projectId,
        user_id: user.id,
        project_role: PROJECT_ROLES.MEMBER,
      },
    });

    res.redirect(`/projects/${projectId}`);
  } catch (error) {
    console.error('Add member error:', error);
    res.redirect(`/projects/${req.params.id}?error=add_failed`);
  }
};

// [POST] /projects/:id/tasks — Create task
exports.createTask = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const userId = res.locals.user.id;
    const { title, description, priority, start_date, due_date } = req.body;

    await prisma.tasks.create({
      data: {
        project_id: projectId,
        title,
        description: description || null,
        priority: priority || 'medium',
        start_date: start_date ? new Date(start_date) : null,
        due_date: due_date ? new Date(due_date) : null,
        created_by: userId,
      },
    });

    res.redirect(`/projects/${projectId}`);
  } catch (error) {
    console.error('Create task error:', error);
    res.redirect(`/projects/${req.params.id}?error=task_create_failed`);
  }
};

// [PATCH] /projects/:id/tasks/:taskId/status — Update task status (drag & drop)
exports.updateTaskStatus = async (req, res) => {
  try {
    const taskId = Number(req.params.taskId);
    const { status } = req.body;
    const userId = res.locals.user.id;

    const validStatuses = ['todo', 'doing', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // If moving to 'done', only team_leader can do it
    if (status === 'done' && res.locals.membership.project_role !== PROJECT_ROLES.TEAM_LEADER) {
      return res.status(403).json({ error: 'Only team leader can approve tasks' });
    }

    const updateData = { status };

    // If approved (moved to done), record who approved
    if (status === 'done') {
      updateData.approved_by = userId;
      updateData.approved_at = new Date();
    }

    await prisma.tasks.update({
      where: { id: taskId },
      data: updateData,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// [POST] /projects/:id/tasks/:taskId/assign — Assign member to task
exports.assignTask = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const taskId = Number(req.params.taskId);
    const { assignee_id } = req.body;
    const userId = res.locals.user.id;

    await prisma.task_assignments.create({
      data: {
        task_id: taskId,
        assignee_id: Number(assignee_id),
        assigned_by: userId,
      },
    });

    res.redirect(`/projects/${projectId}`);
  } catch (error) {
    console.error('Assign task error:', error);
    res.redirect(`/projects/${req.params.id}?error=assign_failed`);
  }
};

// [POST] /projects/:id/tasks/:taskId/comments — Add comment
exports.addComment = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const taskId = Number(req.params.taskId);
    const userId = res.locals.user.id;
    const { content } = req.body;

    await prisma.comments.create({
      data: {
        task_id: taskId,
        user_id: userId,
        content,
      },
    });

    res.redirect(`/projects/${projectId}`);
  } catch (error) {
    console.error('Add comment error:', error);
    res.redirect(`/projects/${req.params.id}`);
  }
};
