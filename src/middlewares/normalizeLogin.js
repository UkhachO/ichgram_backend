export default function normalizeLogin(req, _res, next) {
  const b = req.body || {};
  const v = b.emailOrUsername ?? b.login ?? b.user ?? b.email ?? b.username;

  if (v && !b.email && !b.username) {
    const s = String(v).trim();
    if (s.includes('@')) req.body.email = s;
    else req.body.username = s;
  }
  next();
}
