import prisma from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.utils.js';
import { getAuthCookieOptions, getClearCookieOptions } from '../utils/cookie.utils.js';

// REGISTER CONTROLLER
export const register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, address, password } = req.body;

    // Check if user already exists (by email or phone number)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'phone number';
      return res.status(409).json({
        status: 'fail',
        message: `An account with this ${field} already exists.`,
      });
    }

    // Hash password securely with bcrypt
    const hashedPassword = await hashPassword(password);

    // Create new user in PostgreSQL database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        address: address || null,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Account registered successfully. Please log in.',
      data: { user: newUser },
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN CONTROLLER
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // Support login using either email or phone number
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { phoneNumber: identifier }],
      },
    });

    // Timing attack mitigation: compare against a dummy hash if user isn't found
    const dummyHash = '$2b$12$eImiTXuWVxfM37uY4JANjO56k4P5vM5h1bS241.Y41f1111111111';
    const passwordMatch = await comparePassword(password, user ? user.password : dummyHash);

    if (!user || !passwordMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email/phone number or password.',
      });
    }

    // Issue secure HttpOnly session cookie (storing user.id as session token for simplicity)
    res.cookie('sessionId', user.id, getAuthCookieOptions());

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT CONTROLLER
export const logout = async (req, res, next) => {
  try {
    res.clearCookie('sessionId', getClearCookieOptions());

    return res.status(200).json({
      status: 'success',
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// GET CURRENT USER PROFILE (Protected Route Test)
export const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      status: 'success',
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
};