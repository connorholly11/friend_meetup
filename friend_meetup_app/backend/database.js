const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Initialize the database
let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the in-memory SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table', err);
      } else {
        console.log('Users table created or already exists.');
      }
    });
  }
});

// Create a new user
function createUser(username, password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
      }
    });
  });
}

// Get a user by username
function getUser(username) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Update a user's password
function updateUser(username, newPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(newPassword, 10, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        db.run('UPDATE users SET password = ? WHERE username = ?', [hash, username], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        });
      }
    });
  });
}

// Delete a user
function deleteUser(username) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM users WHERE username = ?', [username], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser
};
