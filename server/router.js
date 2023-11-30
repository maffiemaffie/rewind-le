const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
    app.get('/getLastFm', controllers.LastFm.getLastFm);

    app.get('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);
    app.get('/searchDomos', mid.requiresLogin, controllers.Domo.getDomosByName);

    app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

    app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

    app.get('/logout', mid.requiresLogin, controllers.Account.logout);

    app.get('/connectLastFm', mid.requiresSecure, mid.requiresNoLastFm, controllers.Account.linkAccountPage);
    app.post('/connectLastFm/setAccount', mid.requiresLogin, mid.requiresNoLastFm, controllers.Account.setAccount);
    app.post('/connectLastFm/confirmAccount', mid.requiresLogin, mid.requiresNoLastFm, controllers.Account.confirmAccount);

    app.get('/play', mid.requiresLogin, mid.requiresLastFm, controllers.Game.gamePage);
    app.get('/play/getGameInfo', mid.requiresLogin, mid.requiresLastFm, controllers.Game.getData);
    app.post('/play/guess', mid.requiresLogin, controllers.Game.guess);
    // app.post('/play/hint', mid.requiresLogin, controllers.Game.hint);

    app.get('/maker', mid.requiresLogin, controllers.Domo.makerPage);
    app.post('/maker', mid.requiresLogin, controllers.Domo.makeDomo);

    app.get('/search', mid.requiresLogin, controllers.Domo.searchPage);

    app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;