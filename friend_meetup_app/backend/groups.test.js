import { createGroup, sendInvitation, respondToInvitation } from './groups.js';
import assert from 'assert';

// Mock database operations
const mockDatabase = {
  run: (query, params, callback) => {
    if (query.includes('INSERT INTO groups')) {
      if (params[0] === 'Existing Group') {
        callback(new Error('UNIQUE constraint failed: groups.name'));
      } else {
        callback(null, { lastID: 1, changes: 1 });
      }
    } else if (query.includes('INSERT INTO invitations')) {
      callback(null, { lastID: 1, changes: 1 });
    } else if (query.includes('UPDATE invitations')) {
      if (params[1] === 999) {
        callback(null, { lastID: undefined, changes: 0 });
      } else {
        callback(null, { lastID: undefined, changes: 1 });
      }
    } else {
      callback(null, { lastID: 1, changes: 1 });
    }
  }
};

// Override the database methods in the imported modules
createGroup.__setMockDatabase(mockDatabase);
sendInvitation.__setMockDatabase(mockDatabase);
respondToInvitation.__setMockDatabase(mockDatabase);

async function runTests() {
  try {
    console.log('Testing Friend Group and Invitation Features');

    // Test: Create a new group
    try {
      const groupId = await createGroup('Test Group', 1);
      assert.strictEqual(groupId, 1);
      console.log('✓ Create a new group');
    } catch (error) {
      console.error('✗ Create a new group:', error.message);
    }

    // Test: Create a group with existing name
    try {
      await createGroup('Existing Group', 1);
      console.error('✗ Create a group with existing name: Expected error was not thrown');
    } catch (error) {
      assert.strictEqual(error.message, 'A group with this name already exists');
      console.log('✓ Create a group with existing name');
    }

    // Test: Send an invitation
    try {
      const invitationId = await sendInvitation(1, 2);
      assert.strictEqual(invitationId, 1);
      console.log('✓ Send an invitation');
    } catch (error) {
      console.error('✗ Send an invitation:', error.message);
    }

    // Test: Accept an invitation
    try {
      await respondToInvitation(1, 'accepted');
      console.log('✓ Accept an invitation');
    } catch (error) {
      console.error('✗ Accept an invitation:', error.message);
    }

    // Test: Deny an invitation
    try {
      await respondToInvitation(2, 'denied');
      console.log('✓ Deny an invitation');
    } catch (error) {
      console.error('✗ Deny an invitation:', error.message);
    }

    // Test: Respond to invitation with invalid status
    try {
      await respondToInvitation(3, 'invalid');
      console.error('✗ Respond to invitation with invalid status: Expected error was not thrown');
    } catch (error) {
      assert.strictEqual(error.message, 'Invalid status. Must be "accepted" or "denied".');
      console.log('✓ Respond to invitation with invalid status');
    }

    // Test: Respond to non-existent invitation
    try {
      await respondToInvitation(999, 'accepted');
      console.error('✗ Respond to non-existent invitation: Expected error was not thrown');
    } catch (error) {
      assert.strictEqual(error.message, 'Invitation not found');
      console.log('✓ Respond to non-existent invitation');
    }

  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

runTests();
