const nodemailer = require('nodemailer')
const env = require('../config/env')

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html })
}

const sendVerificationEmail = async (to, token) => {
  const link = `${env.CLIENT_URL}/verify-email?token=${token}`
  await sendMail({
    to,
    subject: 'Verify your Trip.io account',
    html: `
      <h2>Welcome to Trip.io</h2>
      <p>Click the link below to verify your email address. It expires in 24 hours.</p>
      <a href="${link}">${link}</a>
    `,
  })
}

const sendPasswordResetEmail = async (to, token) => {
  const link = `${env.CLIENT_URL}/reset-password?token=${token}`
  await sendMail({
    to,
    subject: 'Reset your Trip.io password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${link}">${link}</a>
      <p>If you did not request this, ignore this email.</p>
    `,
  })
}

module.exports = { sendMail, sendVerificationEmail, sendPasswordResetEmail }
