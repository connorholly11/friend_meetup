const { createGroup, sendInvitation, respondToInvitation } = require('./groups');

// Mock the database operations
jest.mock('sqlite3', () => ({
  verbose: jest.fn(() => ({
    Database: jest.fn(() => ({
      serialize: jest.fn(callback => callback()),
      run: jest.fn((query, params, callback) => {
        const handleCallback = (err, result) => {
          if (typeof callback === 'function') {
            if (err) {
              callback.call({ lastID: undefined, changes: 0 }, err);
            } else {
              callback.call({ lastID: result.lastID, changes: result.changes }, null);
            }
          }
        };

        if (query.includes('INSERT INTO groups')) {
          if (params[0] === 'Existing Group') {
            handleCallback(new Error('UNIQUE constraint failed: groups.name'));
          } else {
            handleCallback(null, { lastID: 1, changes: 1 });
          }
        } else if (query.includes('INSERT INTO invitations')) {
          handleCallback(null, { lastID: 1, changes: 1 });
        } else if (query.includes('UPDATE invitations')) {
          if (params[1] === 999) {
            handleCallback(null, { lastID: undefined, changes: 0 });
          } else {
            handleCallback(null, { lastID: undefined, changes: 1 });
          }
        } else {
          handleCallback(null, { lastID: 1, changes: 1 });
        }
      }),
    })),
  })),
}));

describe('Friend Group and Invitation Features', () => {
  test('Create a new group', async () => {
    const groupId = await createGroup('Test Group', 1);
    expect(groupId).toBe(1);
  });

  test('Create a group with existing name', async () => {
    await expect(createGroup('Existing Group', 1)).rejects.toThrow('A group with this name already exists');
  });

  test('Send an invitation', async () => {
    const invitationId = await sendInvitation(1, 2);
    expect(invitationId).toBe(1);
  });

  test('Accept an invitation', async () => {
    await expect(respondToInvitation(1, 'accepted')).resolves.not.toThrow();
  });

  test('Deny an invitation', async () => {
    await expect(respondToInvitation(2, 'denied')).resolves.not.toThrow();
  });

  test('Respond to invitation with invalid status', async () => {
    await expect(respondToInvitation(3, 'invalid')).rejects.toThrow('Invalid status. Must be "accepted" or "denied".');
  });

  test('Respond to non-existent invitation', async () => {
    await expect(respondToInvitation(999, 'accepted')).rejects.toThrow('Invitation not found');
  });
});
