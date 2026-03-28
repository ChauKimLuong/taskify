const prisma = require('../../config/prisma');
const { PROJECT_ROLES } = require('../../helpers/role.helper');

function formatRelativeVi(date) {
  if (!date) return '';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 15) return 'Vừa xong';
  if (s < 60) return `${s} giây trước`;
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  return `${Math.floor(s / 86400)} ngày trước`;
}

function formatCommentTime(date) {
  return new Date(date).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });
}

/** Chuỗi YYYY-MM-DD theo UTC (đồng bộ với @db.Date / input date). */
function toYmd(d) {
  if (d === null || d === undefined) return null;
  const x = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  const y = x.getUTCFullYear();
  const m = String(x.getUTCMonth() + 1).padStart(2, '0');
  const day = String(x.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Chỉ kiểm tra khi đủ cả hai ngày. */
function validateTaskDateRange(start, due) {
  if (!start || !due) return null;
  const s = toYmd(start);
  const e = toYmd(due);
  if (!s || !e) return null;
  if (s > e) {
    return 'Ngày bắt đầu không được sau hạn chót.';
  }
  return null;
}

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
      boardQueryError: req.query.error || null,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// [GET] /projects/:id/tasks/:taskId — Task detail (modal layout)
exports.getTaskDetail = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const taskId = Number(req.params.taskId);
    if (!Number.isInteger(projectId) || !Number.isInteger(taskId)) {
      return res.status(404).render('client/pages/errors/404', { title: 'Not Found' });
    }

    const task = await prisma.tasks.findFirst({
      where: { id: taskId, project_id: projectId },
      include: {
        project: { select: { id: true, project_name: true } },
        creator: {
          select: { id: true, full_name: true, email: true, avatar_url: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, full_name: true, email: true, avatar_url: true },
            },
          },
          orderBy: { created_at: 'asc' },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, full_name: true, email: true, avatar_url: true },
            },
          },
        },
      },
    });

    if (!task) {
      return res.status(404).render('client/pages/errors/404', { title: 'Not Found' });
    }

    const members = await prisma.project_members.findMany({
      where: { project_id: projectId },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, avatar_url: true },
        },
      },
    });

    const assignedIds = new Set(task.assignees.map((a) => a.assignee_id));
    const assignCandidates = members.filter((m) => !assignedIds.has(m.user_id));

    res.render('client/pages/project/task-detail', {
      title: task.title,
      user: res.locals.user,
      project: task.project,
      task,
      membership: res.locals.membership,
      isTeamLeader: res.locals.membership.project_role === PROJECT_ROLES.TEAM_LEADER,
      members,
      assignCandidates,
      lastActivityText: formatRelativeVi(task.updated_at),
      formatCommentTime,
      queryError: req.query.error || null,
    });
  } catch (error) {
    console.error('Get task detail error:', error);
    res.redirect(`/projects/${req.params.id}`);
  }
};

// [PATCH] /projects/:id/tasks/:taskId — Update title, description, priority, start_date, due_date
exports.patchTask = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const taskId = Number(req.params.taskId);
    if (!Number.isInteger(projectId) || !Number.isInteger(taskId)) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const existing = await prisma.tasks.findFirst({
      where: { id: taskId, project_id: projectId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, priority, start_date, due_date } = req.body;
    const data = {};

    if (title !== undefined && String(title).trim()) {
      data.title = String(title).trim().slice(0, 300);
    }
    if (description !== undefined) {
      data.description = description === '' || description === null ? null : String(description);
    }
    if (priority !== undefined) {
      const p = String(priority).toLowerCase();
      if (['low', 'medium', 'high'].includes(p)) data.priority = p;
    }

    const touchesDates = start_date !== undefined || due_date !== undefined;
    let nextStart = existing.start_date;
    let nextDue = existing.due_date;

    if (start_date !== undefined) {
      nextStart = start_date === '' || start_date === null ? null : new Date(start_date);
      data.start_date = nextStart;
    }
    if (due_date !== undefined) {
      nextDue = due_date === '' || due_date === null ? null : new Date(due_date);
      data.due_date = nextDue;
    }

    if (touchesDates) {
      const rangeErr = validateTaskDateRange(nextStart, nextDue);
      if (rangeErr) {
        return res.status(400).json({ error: rangeErr });
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No valid fields' });
    }

    await prisma.tasks.update({
      where: { id: taskId },
      data,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Patch task error:', error);
    res.status(500).json({ error: 'Server error' });
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

    const startD = start_date ? new Date(start_date) : null;
    const dueD = due_date ? new Date(due_date) : null;
    const rangeErr = validateTaskDateRange(startD, dueD);
    if (rangeErr) {
      return res.redirect(`/projects/${projectId}?error=date_range_invalid`);
    }

    await prisma.tasks.create({
      data: {
        project_id: projectId,
        title,
        description: description || null,
        priority: priority || 'medium',
        start_date: startD,
        due_date: dueD,
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
    const projectId = Number(req.params.id);
    const taskId = Number(req.params.taskId);
    const { status } = req.body;
    const userId = res.locals.user.id;

    const task = await prisma.tasks.findFirst({
      where: { id: taskId, project_id: projectId },
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

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
    const assigneeIdNum = Number(assignee_id);

    const task = await prisma.tasks.findFirst({
      where: { id: taskId, project_id: projectId },
    });
    if (!task) {
      return res.redirect(`/projects/${projectId}?error=task_not_found`);
    }

    const member = await prisma.project_members.findUnique({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: assigneeIdNum,
        },
      },
    });
    if (!member) {
      return res.redirect(`/projects/${projectId}/tasks/${taskId}?error=not_project_member`);
    }

    await prisma.task_assignments.create({
      data: {
        task_id: taskId,
        assignee_id: assigneeIdNum,
        assigned_by: userId,
      },
    });

    res.redirect(`/projects/${projectId}/tasks/${taskId}`);
  } catch (error) {
    console.error('Assign task error:', error);
    res.redirect(`/projects/${req.params.id}/tasks/${req.params.taskId}?error=assign_failed`);
  }
};

// [POST] /projects/:id/tasks/:taskId/comments — Add comment
exports.addComment = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const taskId = Number(req.params.taskId);
    const userId = res.locals.user.id;
    const { content } = req.body;

    const task = await prisma.tasks.findFirst({
      where: { id: taskId, project_id: projectId },
    });
    if (!task) {
      return res.redirect(`/projects/${projectId}`);
    }

    const text = content && String(content).trim();
    if (!text) {
      return res.redirect(`/projects/${projectId}/tasks/${taskId}`);
    }

    await prisma.comments.create({
      data: {
        task_id: taskId,
        user_id: userId,
        content: text,
      },
    });

    res.redirect(`/projects/${projectId}/tasks/${taskId}`);
  } catch (error) {
    console.error('Add comment error:', error);
    res.redirect(`/projects/${req.params.id}/tasks/${req.params.taskId}`);
  }
};
