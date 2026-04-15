exports.index = (req, res) => {
  res.render('client/pages/home/index', {
    title: 'Taskify | Team Workspace & Project Management',
  });
};
