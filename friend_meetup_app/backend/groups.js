const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// Create tables for groups and invitations
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    owner_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS invitations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    invited_user_id INTEGER,
    status TEXT CHECK(status IN ('pending', 'accepted', 'denied')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups (id),
    FOREIGN KEY (invited_user_id) REFERENCES users (id)
  )`);
});

function createGroup(name, ownerId) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO groups (name, owner_id) VALUES (?, ?)', [name, ownerId], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          reject(new Error('A group with this name already exists'));
        } else {
          reject(err);
        }
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function sendInvitation(groupId, invitedUserId) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO invitations (group_id, invited_user_id, status) VALUES (?, ?, ?)',
           [groupId, invitedUserId, 'pending'], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function respondToInvitation(invitationId, status) {
  return new Promise((resolve, reject) => {
    if (!['accepted', 'denied'].includes(status)) {
      reject(new Error('Invalid status. Must be "accepted" or "denied".'));
      return;
    }

    db.run('UPDATE invitations SET status = ? WHERE id = ?', [status, invitationId], function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject(new Error('Invitation not found'));
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  createGroup,
  sendInvitation,
  respondToInvitation
};
