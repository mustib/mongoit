import { MongoDb } from '../../utils';

export type UserSchema = {
  name: { first: string; last: string };
  email: string;
  isVerifiedEmail?: boolean;
  age: number;
  password: string;
  role?: 'user' | 'admin' | 'owner';
  createdAt?: Date;
};

const usersCollection =
  MongoDb.getMongoDb('main').getCollection<UserSchema>('users');

usersCollection.collection.then((collection) =>
  collection.createIndex('email', { unique: true })
);

usersCollection.createSchema({
  name: {
    type: {
      first: {
        type: 'string',
        required: [true, `user's first name is a required field`],
        maxLength: [
          15,
          `maximum length for user's first name is 15 characters`,
        ],
        caseType: 'capitalize',
      },
      last: {
        type: 'string',
        required: [true, `user's last name is a required field`],
        maxLength: [15, `maximum length for user's last name is 15 characters`],
        caseType: 'capitalize',
      },
    },
  },
  email: {
    type: 'string',
    required: [true, 'user email is a required field'],
    validator: [validateEmail, 'email is not valid'],
    caseType: 'lowerCase',
  },
  isVerifiedEmail: {
    type: 'bool',
    default: false,
  },
  age: {
    type: 'number',
    required: [true, 'user age is a required field'],
    min: [16, 'user age must be at least 16 years old'],
  },
  password: {
    type: 'string',
    required: [true, 'user password is a required field'],
    minLength: [8, 'user password minimum length must be 8'],
    maxLength: [48, 'user password maximum length must be 48'],
  },
  role: {
    type: 'string',
    default: 'user',
  },
  createdAt: {
    type: 'date',
    default() {
      return new Date();
    },
  },
});

function validateEmail(email: string) {
  /* 
    VALIDATION ACCORDING TO 
    https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#email-address-validation
  */

  // The total length should be no more than 254 characters.
  if (email.length > 254) return false;

  // The email address contains two parts, separated with an @ symbol.
  const emailParts = email.split('@');
  if (emailParts.length !== 2) return false;

  // The local part (before the @) should be no more than 63 characters.
  if (emailParts[0].length > 63 || emailParts[0].length === 0) return false;

  // the domain part contains only letters, numbers, hyphens (-) and periods (.)
  if (!/^[A-Za-z0-9.-]*$/.test(emailParts[1])) return false;

  return true;
}

const userModel = usersCollection;

export default userModel;
