const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// Create tables for event suggestions and votes
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS event_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    activity TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS event_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    suggestion_id INTEGER,
    user_id INTEGER,
    vote BOOLEAN,
    FOREIGN KEY (suggestion_id) REFERENCES event_suggestions (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// Function to add an event suggestion
function addEventSuggestion(groupId, activity) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO event_suggestions (group_id, activity) VALUES (?, ?)',
      [groupId, activity],
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

// Function to vote on an event suggestion
function voteOnEventSuggestion(suggestionId, userId, vote) {
  return new Promise((resolve, reject) => {
    db.run('INSERT OR REPLACE INTO event_votes (suggestion_id, user_id, vote) VALUES (?, ?, ?)',
      [suggestionId, userId, vote],
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

// Function to get all event suggestions for a group
function getEventSuggestions(groupId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM event_suggestions WHERE group_id = ? ORDER BY created_at DESC', [groupId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Function to count votes for each suggestion
function countVotesForSuggestion(suggestionId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END) as yes_votes, SUM(CASE WHEN vote = 0 THEN 1 ELSE 0 END) as no_votes FROM event_votes WHERE suggestion_id = ?', [suggestionId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Function to get top voted activities for a group
function getTopVotedActivities(groupId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT es.id, es.activity,
             SUM(CASE WHEN ev.vote = 1 THEN 1 ELSE 0 END) as yes_votes,
             SUM(CASE WHEN ev.vote = 0 THEN 1 ELSE 0 END) as no_votes
      FROM event_suggestions es
      LEFT JOIN event_votes ev ON es.id = ev.suggestion_id
      WHERE es.group_id = ?
      GROUP BY es.id
      ORDER BY yes_votes DESC, no_votes ASC
    `, [groupId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  addEventSuggestion,
  voteOnEventSuggestion,
  getEventSuggestions,
  countVotesForSuggestion,
  getTopVotedActivities
};
