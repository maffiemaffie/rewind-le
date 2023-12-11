const models = require('../models');
const { updateHints } = require('./Game');

const { Account, Stats } = models;
const LastFm = require('./LastFm');

const loginPage = (req, res) => res.render('login');

const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/play' });
  });
};

const createNewStats = (req) => {
  const owner = req.session.account._id;
  const breakdown = [];
  for (let i = 1; i <= 10; i++) {
    breakdown.push({ guesses: i, frequency: 0 });
  }
  const statsDoc = {
    allTime: {
      wins: 0,
      losses: 0,
      breakdown,
    },
    completedGames: [],
    owner,
  };

  return new Stats(statsDoc);
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();

    req.session.account = Account.toAPI(newAccount);

    const newStats = createNewStats(req, res);
    await newStats.save();

    return res.status(201).json({ redirect: '/connectLastFm' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const linkAccountPage = async (req, res) => res.render('linkAcc');

const setAccount = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    res.status(400).json({ error: 'Username field required' });
  }

  const response = await LastFm.findAccount(username);

  if (response.code === 200) {
    req.session.username = username;
  }

  res.status(response.code).json(response.json);
};

const confirmAccount = async (req, res) => {
  const filter = { _id: req.session.account._id };
  const update = { lastFmAccount: req.session.username };

  const account = await Account.findOneAndUpdate(filter, update, {
    new: true,
  });

  req.session.account = Account.toAPI(account);

  delete req.session.username;

  res.json({ redirect: '/play' });
};

const removeAccount = (req, res) => {
  delete req.session.account.lastFm;

  res.status(204).json({});
};

const getInfo = (req, res) => {
  res.json({
    username: req.session.account.username,
    hasPremium: req.session.account.isPremiumUser,
  });
};

const changePassword = async (req, res) => {
  const oldPassword = `${req.body.oldPassword}`;
  const newPassword = `${req.body.newPassword}`;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const hash = await Account.generateHash(newPassword);

  return Account.changePassword(
    req.session.account.username,
    oldPassword,
    hash,
    async (err, account) => {
      if (err || !account) {
        return res.status(403).json({ error: 'Wrong password!' });
      }

      req.session.account = Account.toAPI(account);

      return res.status(204).json({});
    },
  );
};

const activatePremium = async (req, res) => {
  const query = { _id: req.session.account._id };
  const account = await Account.findOne(query);

  if (account.isPremiumUser) return res.status(422).json({ error: 'User is already a premium member' });
  account.isPremiumUser = true;
  await account.save();
  req.session.account = Account.toAPI(account);

  return res.status(204).json({});
};

const cancelPremium = async (req, res) => {
  const query = { _id: req.session.account._id };
  const account = await Account.findOne(query);

  if (!account.isPremiumUser) return res.status(404).json({ error: 'User is not a premium member' });
  account.isPremiumUser = false;
  await account.save();
  req.session.account = Account.toAPI(account);

  return res.status(204).json({});
};

const buyHints = async (req, res) => {
  const { amount } = req.body;

  if (!amount) return res.status(400).json({ error: 'Must specify number of hints' });

  const query = { _id: req.session.account._id };
  const account = await Account.findOne(query);

  account.hintsOwned += amount;
  await account.save();
  req.session.account = Account.toAPI(account);

  await updateHints(req, account.hintsOwned);

  return res.status(204).json({});
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  linkAccountPage,
  setAccount,
  confirmAccount,
  removeAccount,
  getInfo,
  changePassword,
  activatePremium,
  cancelPremium,
  buyHints,
};
