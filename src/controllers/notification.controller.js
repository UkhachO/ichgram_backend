import * as notificationService from '../services/notification.service.js';
import {
  listNotificationsSchema,
  markOneSchema,
} from '../schemas/notification.schemas.js';

export const list = async (req, res, next) => {
  try {
    const { value } = listNotificationsSchema.validate(req.query, {
      abortEarly: false,
    });
    const data = await notificationService.list({
      userId: req.user.id,
      ...value,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const readOne = async (req, res, next) => {
  try {
    const { value } = markOneSchema.validate(req.params, { abortEarly: false });
    const data = await notificationService.markOneRead({
      userId: req.user.id,
      notificationId: value.id,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const readAll = async (_req, res, next) => {
  try {
    const data = await notificationService.markAllRead({
      userId: _req.user.id,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};
