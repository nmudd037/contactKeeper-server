const express = require('express');
const { check, validationResult } = require('express-validator');
const authO = require('../middleware/authO');
const Contact = require('../models/Contact');

const router = express.Router();

// @route   GET  api/contacts
// @desc    Get all user contacts
// @access  Private
router.get('/', authO, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1
    });
    res.json(contacts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server Error');
  }
});

// @route   POST  api/contacts
// @desc    Add new contact
// @access  Private
router.post(
  '/',
  [authO, [check('name', 'Name is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, type } = req.body;

    try {
      const contact = await Contact.create({
        name,
        email,
        phone,
        type,
        user: req.user.id
      });

      res.status(200).json(contact);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PATCH  api/contacts/:id
// @desc    Update contact
// @access  Private
router.patch('/:id', authO, async (req, res) => {
  const { name, email, phone, type } = req.body;

  // Build contact object
  const contactFields = {};
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: 'Contact not found' });

    // Make sure user own contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: contactFields },
      { new: true }
    );

    res.status(200).json(contact);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE  api/contacts/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', authO, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: 'Contact not found' });

    // Make sure user own contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Contact.findByIdAndRemove(req.params.id);

    res.status(200).json({ msg: 'Contact removed successfully' });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
