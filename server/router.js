const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getLastFm', controllers.LastFm.getLastFm);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/accountInfo', mid.requiresLogin, controllers.Account.getInfo);

  app.get('/connectLastFm', mid.requiresSecure, mid.requiresNoLastFm, controllers.Account.linkAccountPage);
  app.post('/connectLastFm/setAccount', mid.requiresLogin, mid.requiresNoLastFm, controllers.Account.setAccount);
  app.post('/connectLastFm/confirmAccount', mid.requiresLogin, mid.requiresNoLastFm, controllers.Account.confirmAccount);
  app.post('/connectLastFm/removeAccount', mid.requiresLogin, controllers.Account.removeAccount);

  app.get('/play', mid.requiresLogin, mid.requiresLastFm, controllers.Game.gamePage);
  app.get('/play/getGameInfo', mid.requiresLogin, mid.requiresLastFm, controllers.Game.getData);
  app.post('/play/guess', mid.requiresLogin, controllers.Game.guess);
  app.get('/play/target', mid.requiresLogin, mid.requiresLastFm, controllers.Game.getTarget);
  app.post('/play/hint', mid.requiresLogin, controllers.Game.hint);

  app.get('/stats', mid.requiresLogin, controllers.Game.statsPage);
  app.get('/getStats', mid.requiresLogin, controllers.Game.getStats);

  app.get('/settings', mid.requiresLogin, controllers.Settings.settingsPage);
  app.post('/settings/user/updatePassword', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePassword);
  app.post('/premium/enroll', mid.requiresLogin, mid.requiresSecure, controllers.Account.activatePremium);
  app.post('/premium/cancel', mid.requiresLogin, controllers.Account.cancelPremium);
  app.post('/premium/buyHints', mid.requiresLogin, mid.requiresSecure, controllers.Account.buyHints);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/*', controllers.NotFound);
};

module.exports = router;
