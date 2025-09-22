export const ok = (res, data = {}, status = 200) =>
  res.status(status).json({ ok: true, ...data });
export const created = (res, data = {}) =>
  res.status(201).json({ ok: true, ...data });
export const fail = (res, status = 400, message = 'Bad request', extra = {}) =>
  res.status(status).json({ ok: false, message, ...extra });
