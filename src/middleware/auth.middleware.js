import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed. Please log in to access this resource.',
      });
    }

    // In a full JWT setup, you would verify the JWT here. 
    // For this robust architecture, we match the userId or session token stored in the database.
    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        address: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      res.clearCookie('sessionId');
      return res.status(401).json({
        status: 'fail',
        message: 'User session is invalid or expired. Please log in again.',
      });
    }

    // Attach user profile to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};