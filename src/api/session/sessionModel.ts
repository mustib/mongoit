import crypto from 'crypto';
import { MongoDb } from '../../utils';
import type { UserSchema } from '../user';

export type SessionSchema = {
  _id?: string;
  userId: string;
  role?: Required<UserSchema>['role'];
  createdAt?: Date;
  expiresAt?: Date;
  maxAge?: number;
  ip: string;
  browser: {
    name: string;
    version: number;
  };
  os: {
    name: string;
    platform: string;
  };
  lastLogin?: Date;
};

const sessionCollection =
  MongoDb.getMongoDb('main').getCollection<SessionSchema>('sessions');

sessionCollection.createSchema({
  _id: {
    type: 'string',
    default: () =>
      crypto.randomBytes(32).toString('base64').concat(Date.now().toString(36)),
  },
  userId: 'string',
  role: {
    type: 'string',
    default: 'user',
  },
  createdAt: {
    type: 'date',
    default: () => new Date(),
  },
  expiresAt: {
    type: 'date',
    // after 14 days
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  maxAge: {
    type: 'number',
    // 90 days
    default: () => 90 * 24 * 60 * 60 * 1000,
  },
  ip: 'string',
  browser: {
    type: {
      name: 'string',
      version: 'number',
    },
  },
  os: {
    type: {
      name: 'string',
      platform: 'string',
    },
  },
  lastLogin: {
    type: 'date',
    default: () => new Date(),
  },
});

const sessionModel = sessionCollection;

export default sessionModel;

// It is recommended to change the default session ID name of the web development framework to a generic name, such as id.

/* 
  The session ID must be long enough to prevent brute force attacks, where an attacker can go through the whole range of ID values and verify the existence of valid sessions.
  // The session ID length must be at least 128 bits (16 bytes).
*/
