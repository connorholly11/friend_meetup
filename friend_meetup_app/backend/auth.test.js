// Basic test script for signup, login, and invitation features

import { signup, login } from './auth.js';
import { initializeDatabase, checkUsersTable } from './database.js';
import { createGroup, sendInvitation, respondToInvitation } from './groups.js';
import assert from 'assert';

// Setup function to initialize the database
async function setupDatabase() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Check if users table exists
    const tableExists = await checkUsersTable();
    if (!tableExists) {
      throw new Error('Users table was not created successfully');
    }
    console.log('Users table verified successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Helper function to run all tests
async function runAllTests() {
  let passedTests = 0;
  let totalTests = 13;

  try {
    await setupDatabase();

    // Signup and Login Tests
    console.log('Running Signup and Login Tests...');
    passedTests += await runSignupLoginTests();

    // Invitation Tests
    console.log('\nRunning Invitation Tests...');
    passedTests += await runInvitationTests();

    console.log(`\n${passedTests} out of ${totalTests} tests passed.`);
  } catch (error) {
    console.error('An error occurred during testing:', error);
  }
}

async function runSignupLoginTests() {
  let passedTests = 0;

  // Test case 1: Successful signup
  try {
    console.log('Test case 1: Successful signup');
    const result = await signup('newuser', 'password123');
    assert(result.success === true && result.message === 'User created successfully' && result.userId !== undefined);
    console.log('Test case 1 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 1 failed:', error.message);
  }

  // Test case 2: Signup with existing username
  try {
    console.log('Test case 2: Signup with existing username');
    const result = await signup('newuser', 'anotherpassword');
    assert(result.success === false && result.message === 'Username already exists');
    console.log('Test case 2 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 2 failed:', error.message);
  }

  // Test case 3: Signup with empty username
  try {
    console.log('Test case 3: Signup with empty username');
    const result = await signup('', 'password123');
    assert(result.success === false && result.message === 'Username cannot be empty');
    console.log('Test case 3 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 3 failed:', error.message);
  }

  // Test case 4: Signup with empty password
  try {
    console.log('Test case 4: Signup with empty password');
    const result = await signup('anotheruser', '');
    assert(result.success === false && result.message === 'Password cannot be empty');
    console.log('Test case 4 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 4 failed:', error.message);
  }

  // Test case 5: Successful login
  try {
    console.log('Test case 5: Successful login');
    const result = await login('newuser', 'password123');
    assert(result.success === true && result.message === 'Login successful' && result.userId !== undefined);
    console.log('Test case 5 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 5 failed:', error.message);
  }

  // Test case 6: Login with incorrect username
  try {
    console.log('Test case 6: Login with incorrect username');
    const result = await login('nonexistentuser', 'password123');
    assert(result.success === false && result.message === 'User not found');
    console.log('Test case 6 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 6 failed:', error.message);
  }

  // Test case 7: Login with incorrect password
  try {
    console.log('Test case 7: Login with incorrect password');
    const result = await login('newuser', 'wrongpassword');
    assert(result.success === false && result.message === 'Incorrect password');
    console.log('Test case 7 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 7 failed:', error.message);
  }

  // Test case 8: Login with empty username
  try {
    console.log('Test case 8: Login with empty username');
    const result = await login('', 'password123');
    assert(result.success === false && result.message === 'User not found');
    console.log('Test case 8 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 8 failed:', error.message);
  }

  return passedTests;
}

async function runInvitationTests() {
  let passedTests = 0;

  // Create test users and group
  await signup('user1', 'password1');
  await signup('user2', 'password2');
  const groupResult = await createGroup('TestGroup', 1);
  const groupId = groupResult.groupId;

  // Test case 9: Sending an invitation
  try {
    console.log('Test case 9: Sending an invitation');
    const result = await sendInvitation(groupId, 2);
    assert(result.success === true && result.message === 'Invitation sent successfully');
    console.log('Test case 9 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 9 failed:', error.message);
  }

  // Test case 10: Accepting an invitation
  try {
    console.log('Test case 10: Accepting an invitation');
    const result = await respondToInvitation(1, 'accepted');
    assert(result.success === true && result.message === 'Invitation accepted');
    console.log('Test case 10 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 10 failed:', error.message);
  }

  // Test case 11: Denying an invitation
  try {
    console.log('Test case 11: Denying an invitation');
    const result = await respondToInvitation(2, 'denied');
    assert(result.success === true && result.message === 'Invitation denied');
    console.log('Test case 11 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 11 failed:', error.message);
  }

  // Test case 12: Responding to an invalid invitation
  try {
    console.log('Test case 12: Responding to an invalid invitation');
    const result = await respondToInvitation(999, 'accepted');
    assert(result.success === false && result.message === 'Invitation not found');
    console.log('Test case 12 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 12 failed:', error.message);
  }

  // Test case 13: Inviting a non-existent user
  try {
    console.log('Test case 13: Inviting a non-existent user');
    const result = await sendInvitation(groupId, 999);
    assert(result.success === false && result.message === 'User not found');
    console.log('Test case 13 passed');
    passedTests++;
  } catch (error) {
    console.error('Test case 13 failed:', error.message);
  }

  return passedTests;
}

// Run all tests
runAllTests();
