import * as messageService from '../services/message.service.js';
import {
  sendMessageSchema,
  listDialogSchema,
} from '../schemas/message.schemas.js';

export const send = async (req, res, next) => {
  try {
    const { value } = sendMessageSchema.validate(req.body, {
      abortEarly: false,
    });
    const data = await messageService.sendMessage({
      fromId: req.user.id,
      toId: req.params.userId,
      text: value.text,
    });
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

export const dialog = async (req, res, next) => {
  try {
    const { value } = listDialogSchema.validate(req.query, {
      abortEarly: false,
    });
    const data = await messageService.listDialog({
      userId: req.user.id,
      partnerId: req.params.userId,
      limit: Number(value.limit) || 30,
      before: value.before ? new Date(value.before) : null,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const conversations = async (req, res, next) => {
  try {
    const data = await messageService.getConversations({ userId: req.user.id });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

export const read = async (req, res, next) => {
  try {
    const data = await messageService.markAsRead({
      userId: req.user.id,
      fromId: req.params.userId,
    });
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};
