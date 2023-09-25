import type { Response } from 'express';
import type { SessionSchema } from '../sessionModel';

const createUserSessionCookie = (res: Response, session: SessionSchema) => {
  res.cookie('SID', session._id, {
    httpOnly: true,
    expires: session.expiresAt,
    maxAge: session.maxAge,
    secure: true,
    sameSite: true,
    path: '/',
  });

  res.setHeader('Cache-Control', 'no-cache');
};

export default createUserSessionCookie;