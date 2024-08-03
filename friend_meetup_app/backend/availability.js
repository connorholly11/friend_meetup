const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// Create tables for availability slots and user-to-slot mappings
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS availability_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    day_of_week TEXT,
    start_time TEXT,
    end_time TEXT,
    FOREIGN KEY (group_id) REFERENCES groups (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    slot_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (slot_id) REFERENCES availability_slots (id)
  )`);
});

// Function to add an availability slot for a group
function addAvailabilitySlot(groupId, dayOfWeek, startTime, endTime) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO availability_slots (group_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
      [groupId, dayOfWeek, startTime, endTime],
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

// Function to mark user availability for a slot
function markUserAvailability(userId, slotId) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO user_availability (user_id, slot_id) VALUES (?, ?)',
      [userId, slotId],
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

// Function to get all availability slots for a group
function getGroupAvailabilitySlots(groupId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM availability_slots WHERE group_id = ?', [groupId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Function to get all available users for a slot
function getAvailableUsersForSlot(slotId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT user_id FROM user_availability WHERE slot_id = ?', [slotId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => row.user_id));
      }
    });
  });
}

module.exports = {
  addAvailabilitySlot,
  markUserAvailability,
  getGroupAvailabilitySlots,
  getAvailableUsersForSlot
};
