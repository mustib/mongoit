import jwt from 'jsonwebtoken';
import {
  ApiFailResponse,
  ApiSuccessResponse,
  catchAsyncRouteHandler,
} from '../../../utils';
import { envVars } from '../../../config';
import userModel from '../userModel';

const verifyEmail = catchAsyncRouteHandler(async (req, res) => {
  const { token } = req.params;

  let id: string;
  let email: string;

  const sendInvalidResponse = () =>
    new ApiFailResponse(res).setMessage('invalid or expired token').send();

  try {
    ({ id, email } = jwt.verify(token, envVars.EMAIL_VERIFICATION_SECRET) as {
      id: string;
      email: string;
    });
  } catch (error) {
    sendInvalidResponse();
    return;
  }

  const { modifiedCount, matchedCount } = await userModel
    .updateOne({ _id: id, email }, { isVerifiedEmail: true })
    .exec();

  if (matchedCount === 0) {
    sendInvalidResponse();
    return;
  }

  const message =
    modifiedCount === 1
      ? 'email verified successfully'
      : 'email was verified before';

  ApiSuccessResponse.send(res, undefined, message);
});

export default verifyEmail;
