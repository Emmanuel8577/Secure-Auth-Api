export const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true, // Prevents access via client-side JavaScript (XSS defense)
    secure: isProduction, // Transmitted only over HTTPS in production
    sameSite: 'strict', // Protects against CSRF attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    path: '/',
  };
};

export const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
  };
};