import { createUser, getUser } from './database.js';
import bcrypt from 'bcrypt';

async function signup(username, password) {
  try {
    // Check if username or password is empty
    if (!username || username.trim() === '') {
      return { success: false, message: 'Username cannot be empty' };
    }
    if (!password || password.trim() === '') {
      return { success: false, message: 'Password cannot be empty' };
    }

    // Check if the username already exists
    const existingUser = await getUser(username);
    if (existingUser) {
      return { success: false, message: 'Username already exists' };
    }

    // Create the new user
    const userId = await createUser(username, password);
    return { success: true, message: 'User created successfully', userId };
  } catch (error) {
    console.error('Error during signup:', error);
    return { success: false, message: 'An error occurred during signup' };
  }
}

async function login(username, password) {
  try {
    // Get the user from the database
    const user = await getUser(username);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: 'Incorrect password' };
    }

    // Login successful
    return { success: true, message: 'Login successful', userId: user.id };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'An error occurred during login' };
  }
}

export {
  signup,
  login
};
