const errorHandler = (error, _req, res, _next) => {
  const status = error.status || 500;
  const message = error.message || 'Server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', {
      status,
      message,
      stack: error.stack,
      details: error.details,
    });
  }

  res.status(status).json({
    message,
    details: error.details || undefined,
  });
};

export default errorHandler;
