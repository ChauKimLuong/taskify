exports.index = (req, res) => {
    res.render('client/pages/home', {
        title: 'Home',
        user: {
            name: 'Châu Kim Lương'
        }
    });
};