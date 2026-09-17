import prisma from '../config/db.js';
import { verifyAccessToken } from '../utils/token.utils.js';

export const protect = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        status: 'fail',
        message: 'Access token missing. Please log in.',
      });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(accessToken);
    } catch (err) {
      return res.status(401).json({
        status: 'fail',
        message: 'Access token expired or invalid.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'User belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};