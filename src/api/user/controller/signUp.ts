import bcrypt from 'bcrypt';

import {
  ApiSuccessResponse,
  catchAsyncRouteHandler,
} from '../../../utils/index.js';

import userModel, { type UserSchema } from '../userModel.js';
import { createUserSession } from '../../session/index.js';
import sendEmailVerification from './sendEmailVerification.js';

async function interceptBeforeInserting(doc: UserSchema): Promise<UserSchema> {
  // eslint-disable-next-line no-param-reassign
  doc.password = await bcrypt.hash(doc.password, 12);
  return doc;
}

const signUp = catchAsyncRouteHandler<UserSchema>(async (req, res) => {
  const userData: UserSchema = {
    name: req.body.name,
    age: req.body.age,
    password: req.body.password,
    email: req.body.email,
  };

  // -------------------------------------------
  // TODO IMPROVEMENT: start mongodb transaction
  // -------------------------------------------

  const user = await userModel
    .insertOne(userData, {
      interceptBeforeInserting,
    })
    .exec();

  await createUserSession(req, res, user);

  new ApiSuccessResponse(res).setData(user).send();

  sendEmailVerification(user._id, user.email);
});

export default signUp;
