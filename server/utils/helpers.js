const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate profile initials from username
const generateInitials = (username) => {
  if (!username) return 'U';
  
  const words = username.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Random US states for creator locations
const US_STATES = [
  'California',
  'New York',
  'Texas',
  'Florida',
  'Hawaii',
  'Nevada',
  'Washington',
  'Illinois',
  'Alaska',
  'Colorado',
  'Arizona',
  'Massachusetts',
  'Pennsylvania',
  'New Jersey',
  'Virginia',
  'Georgia',
  'Michigan',
  'Louisiana',
  'Oregon',
  'Ohio'
];

const getRandomState = () => {
  return US_STATES[Math.floor(Math.random() * US_STATES.length)];
};

// Generate random online status
const getRandomOnlineStatus = () => {
  return Math.random() > 0.3; // 70% chance of being online
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate username from email
const generateUsername = (email) => {
  const username = email.split('@')[0];
  return username.toLowerCase().replace(/[^a-z0-9]/g, '');
};

module.exports = {
  generateInitials,
  hashPassword,
  comparePassword,
  generateToken,
  getRandomState,
  getRandomOnlineStatus,
  isValidEmail,
  generateUsername
};