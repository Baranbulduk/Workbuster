import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'rexettit@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'prmursgwotixwilt'
  },
  debug: true
}); 