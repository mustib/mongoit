import bcrypt from 'bcrypt';
import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';
import userModel, { type UserSchema } from '../userModel';

async function interceptBeforeInserting(doc: UserSchema): Promise<UserSchema> {
  // eslint-disable-next-line no-param-reassign
  doc.password = await bcrypt.hash(doc.password, 12);
  /*
    TODO: Send Email Verification
    REF: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#semantic-validation
  */
  return doc;
}

const signUp = catchAsyncRouteHandler<UserSchema>(async (req, res) => {
  const userData: UserSchema = {
    name: req.body.name,
    age: req.body.age,
    password: req.body.password,
    email: req.body.email,
  };

  await userModel
    .insertOne(userData, { interceptBeforeInserting })
    .exec({ returnInserted: false });

  new ApiSuccessResponse(res)
    .setMessage('user has been added successfully')
    .send();
});

export default signUp;
