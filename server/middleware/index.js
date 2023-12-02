const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }
  return next();
};

const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/maker');
  }
  return next();
};

const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};

const bypassSecure = (req, res, next) => next();

const requiresNoLastFm = (req, res, next) => {
  if (req.session.account.lastFmAccount) {
    return res.redirect('/play');
  }
  return next();
};

const requiresLastFm = (req, res, next) => {
  if (!req.session.account.lastFmAccount) {
    return res.redirect('/connectLastFm');
  }
  return next();
};

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;
module.exports.requiresNoLastFm = requiresNoLastFm;
module.exports.requiresLastFm = requiresLastFm;

if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
