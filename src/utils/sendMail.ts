import nodemailer from 'nodemailer';
import { envVars } from '../config/index.js';
import type Mail from 'nodemailer/lib/mailer';

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_HOST,
  port: envVars.EMAIL_PORT,
  secure: envVars.EMAIL_SECURE,
  auth: {
    user: envVars.EMAIL_USER,
    pass: envVars.EMAIL_PASS,
  },
});

function sendMail(options: Mail['options']) {
  transporter.sendMail(options);
}

export default sendMail;
