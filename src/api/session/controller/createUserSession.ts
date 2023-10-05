import sessionModel, { type SessionSchema } from '../sessionModel.js';
import { getUserAgentData } from '../../../utils/index.js';
import createUserSessionCookies from './createUserSessionCookies.js';
import type { UserSchema } from '../../user/index.js';
import type { Request, Response } from 'express';

const createUserSession = async (
  req: Request,
  res: Response,
  user: UserSchema & { _id: string }
) => {
  const { browser, os } = getUserAgentData(req.headers['user-agent']);

  const sessionData: SessionSchema = {
    browser,
    os,
    userId: user._id,
    role: user.role,
    ip: req.ip,
  };

  const userSession = await sessionModel.insertOne(sessionData).exec();

  createUserSessionCookies(res, userSession);
};

export default createUserSession;
