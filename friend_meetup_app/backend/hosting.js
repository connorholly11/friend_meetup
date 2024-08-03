const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// Create table for hosting availability
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS hosting_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    group_id INTEGER,
    day_of_week TEXT,
    activity TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (group_id) REFERENCES groups (id)
  )`);
});

// Function to mark hosting availability
function markHostingAvailability(userId, groupId, dayOfWeek, activity) {
  return new Promise((resolve, reject) => {
    db.run('INSERT OR REPLACE INTO hosting_availability (user_id, group_id, day_of_week, activity) VALUES (?, ?, ?, ?)',
      [userId, groupId, dayOfWeek, activity],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

// Function to get hosting availability for a user in a group
function getHostingAvailability(userId, groupId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM hosting_availability WHERE user_id = ? AND group_id = ?', [userId, groupId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Function to get all hosts available for a specific day and activity in a group
function getAvailableHosts(groupId, dayOfWeek, activity) {
  return new Promise((resolve, reject) => {
    db.all('SELECT user_id FROM hosting_availability WHERE group_id = ? AND day_of_week = ? AND activity = ?',
      [groupId, dayOfWeek, activity],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => row.user_id));
        }
      }
    );
  });
}

// Function to remove hosting availability
function removeHostingAvailability(userId, groupId, dayOfWeek) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM hosting_availability WHERE user_id = ? AND group_id = ? AND day_of_week = ?',
      [userId, groupId, dayOfWeek],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
}

// Function to get all hosting availabilities for a group
function getGroupHostingAvailabilities(groupId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM hosting_availability WHERE group_id = ? ORDER BY day_of_week', [groupId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  markHostingAvailability,
  getHostingAvailability,
  getAvailableHosts,
  removeHostingAvailability,
  getGroupHostingAvailabilities
};
