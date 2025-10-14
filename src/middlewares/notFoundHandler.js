const notFoundHandler = (_req, res) => {
  res.status(404).json({ ok: false, message: 'Not Found' });
};
export default notFoundHandler;
