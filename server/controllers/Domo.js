const models = require('../models');

const { Domo } = models;

const makerPage = (req, res) => res.render('app');

const searchPage = (req, res) => res.render('search');

const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.color || !req.body.age) {
    return res.status(400).json({ error: 'Name, age, and color are required!' });
  }

  const domoData = {
    name: req.body.name,
    color: req.body.color,
    age: req.body.age,
    owner: req.session.account._id,
  };

  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({ name: newDomo.name, color: newDomo.color, age: newDomo.age });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists!' });
    }
    return res.status(500).json({ error: 'An error occured making domo!' });
  }
};

const getDomos = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Domo.find(query).select('name color age').lean().exec();

    return res.json({ domos: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving domos!' });
  }
};

const getDomosByName = async (req, res) => {
  try {
    const query = {
      owner: req.session.account._id,
      name: req.query.name,
    };
    const docs = await Domo.find(query).select('name color age').lean().exec();

    return res.json({ domos: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving domos!' });
  }
};

module.exports = {
  makerPage,
  searchPage,
  makeDomo,
  getDomos,
  getDomosByName,
};
