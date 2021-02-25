const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../../models/User');
const Contact = require('../../models/Contact');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB Connection Successful');
  });

//Read JSON File
//Import Users, Contacts JSON data
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const contacts = JSON.parse(
  fs.readFileSync(`${__dirname}/contacts.json`, 'utf-8')
);

//Import Data into the Database
const importData = async () => {
  try {
    await User.create(users);
    await Contact.create(contacts);
    console.log('Data Successfully loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//Delete all Data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Contact.deleteMany();
    console.log('Data Successfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
//console.log(process.argv);
