// const User = require('../models/user.model');
// const { hashPassword, comparePassword } = require('../utils/hash');
// const { generateToken } = require('../utils/jwt');

// exports.register = async ({ username, email, password, role }) => {
//   const existing = await User.findOne({ $or: [{ email }, { username }] });
//   if (existing) throw new Error('User already exists');
//   const hashed = await hashPassword(password);
//   const user = await User.create({ username, email, password: hashed, role });
//   return { message: 'User registered successfully', user: { id: user._id, username: user.username, role: user.role } };
// };

// exports.login = async ({ email, password }) => {
//   const user = await User.findOne({ email });
//   if (!user) throw new Error('Invalid credentials');
//   const isValid = await comparePassword(password, user.password);
//   if (!isValid) throw new Error('Invalid credentials');
//   const token = generateToken({ id: user._id, role: user.role });
//   return { message: 'Login successful', token };
// };

const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

exports.register = async ({ username, email, password, confirmPassword, role }) => {
  try {
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) throw new Error('User already exists');

  const hashed = await hashPassword(password);
    const user = await User.create({ username, email, password: hashed, role });

  return {
    message: 'User registered successfully',
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

exports.login = async ({ email, password }) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

  const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      throw new Error('Invalid credentials');
    }

  const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      console.log('Invalid password for user:', email);
      throw new Error('Invalid credentials');
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      throw new Error('Server configuration error');
    }

  const token = generateToken({ id: user._id, role: user.role });

  return {
    message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
