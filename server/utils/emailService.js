import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// console.log('MAILTRAP_HOST:', process.env.MAILTRAP_HOST);
// console.log('MAILTRAP_PORT:', process.env.MAILTRAP_PORT);
// console.log('MAILTRAP_USER:', process.env.MAILTRAP_USER);
// console.log('MAILTRAP_PASS:', process.env.MAILTRAP_PASS);

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: parseInt(process.env.MAILTRAP_PORT || "587"),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  },
});


export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `http://localhost:5000/api/auth/verify/${token}`;
  const mailOptions = {
    from: 'temp000rare@gmail.com',
    to: email,
    subject: 'Verify Your Email - CivicConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to CivicConnect!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #4F46E5;">${verificationUrl}</p>
        <p>This verification link will expire in 24 hours.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account with CivicConnect, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};