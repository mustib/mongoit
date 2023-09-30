import jwt from 'jsonwebtoken';
import { envVars } from '../../../config';
import { sendMail } from '../../../utils';

function sendEmailVerification(id: string, email: string) {
  const emailVerificationToken = jwt.sign(
    { id, email },
    envVars.EMAIL_VERIFICATION_SECRET,
    {
      expiresIn: envVars.EMAIL_VERIFICATION_EXPIRE,
    }
  );

  const emailVerificationUrl = `${envVars.HOST_URL}:${envVars.PORT}/${envVars.EMAIL_VERIFICATION_PATH}/${emailVerificationToken}`;

  sendMail({
    from: 'Home-Furniture <users@Home-Furniture.com>',
    to: email,
    html: `
    <p>Please confirm your email <a href='${emailVerificationUrl}'>here</a></p>
  `,
    subject: 'confirm your email',
  });
}

export default sendEmailVerification;
