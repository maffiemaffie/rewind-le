const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
    app.get('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);
    app.get('/searchDomos', mid.requiresLogin, controllers.Domo.getDomosByName);

    app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

    app.get('/logout', mid.requiresLogin, controllers.Account.logout);

    app.get('setLastFmAccount', mid.requiresLogin, controllers.LastFm.setAccount);
    app.get('confirmLastFmAccount', mid.requiresLogin, controllers.LastFm.confirmAccount);

    app.get('/maker', mid.requiresLogin, controllers.Domo.makerPage);
    app.post('/maker', mid.requiresLogin, controllers.Domo.makeDomo);

    app.get('/search', mid.requiresLogin, controllers.Domo.searchPage);

    app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;