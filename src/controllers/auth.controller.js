import prisma from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.utils.js';
import { generateTokens, verifyRefreshToken } from '../utils/token.utils.js';
import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getClearCookieOptions,
} from '../utils/cookie.utils.js';

// REGISTER CONTROLLER
export const register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, address, password, role } = req.body;

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
        role: role || 'USER'
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

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { phoneNumber: identifier }],
      },
    });

    const dummyHash = '$2b$12$eImiTXuWVxfM37uY4JANjO56k4P5vM5h1bS241.Y41f1111111111';
    const passwordMatch = await comparePassword(password, user ? user.password : dummyHash);

    if (!user || !passwordMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email/phone number or password.',
      });
    }

    // Generate dual tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Send both in secure HttpOnly cookies
    res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// REFRESH TOKEN CONTROLLER
export const refreshToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        status: 'fail',
        message: 'Refresh token missing. Please log in again.',
      });
    }

    // Verify refresh token payload signature
    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
      return res.status(401).json({
        status: 'fail',
        message: 'Expired or invalid refresh token.',
      });
    }

    // Find user and match stored refresh token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid refresh token session.',
      });
    }

    // Issue new pair (Token Rotation)
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.cookie('accessToken', newAccessToken, getAccessTokenCookieOptions());
    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

    return res.status(200).json({
      status: 'success',
      message: 'Tokens refreshed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT CONTROLLER
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const user = await prisma.user.findFirst({ where: { refreshToken } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
      }
    }

    res.clearCookie('accessToken', getClearCookieOptions());
    res.clearCookie('refreshToken', getClearCookieOptions());

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


export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};