import bcrypt from 'bcrypt';
import {
  ApiFailResponse,
  ApiSuccessResponse,
  catchAsyncRouteHandler,
} from '../../../utils/index.js';

import userModel, { type UserSchema } from '../userModel.js';
import { createUserSession } from '../../session/index.js';

const signIn = catchAsyncRouteHandler<UserSchema>(async (req, res) => {
  const { email, password } = req.sanitizeMongo.body.get(['password', 'email']);

  userModel.schema?.validate({ email, password }, 'PARTIAL');

  const user = await userModel.findOne({ email }).exec();

  /* 
    allowing the application to return in approximately the same response time to prevent user enumeration
    so it should take the same time even if the user doesn't exist
    REF: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
  */
  const isTheRightPassword = await bcrypt.compare(
    password,
    user?.password ?? (await bcrypt.genSalt(12))
  );

  if (!isTheRightPassword || !user) {
    new ApiFailResponse(res)
      .setMessage('Invalid user email or password')
      .unAuthorized();
    return;
  }

  await createUserSession(req, res, user);

  new ApiSuccessResponse(res).setData(user).send();
});

export default signIn;
