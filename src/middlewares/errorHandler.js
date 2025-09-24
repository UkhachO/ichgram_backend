const errorHandler = (error, _req, res, _next) => {
  const status = error.status || 500;
  const message = error.message || 'Server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', { status, message, stack: error.stack });
  }

  res.status(status).json({ message });
};
export default errorHandler;
