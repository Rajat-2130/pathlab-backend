const Brevo = require('@getbrevo/brevo')

const apiInstance = new Brevo.TransactionalEmailsApi()

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
)

const sendEmail = async ({ to, subject, html }) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail()

  sendSmtpEmail.subject = subject
  sendSmtpEmail.htmlContent = html
  sendSmtpEmail.sender = {
    name: 'PathLab Diagnostics',
    email: process.env.EMAIL_FROM_ADDRESS,
  }
  sendSmtpEmail.to = [{ email: to }]

  await apiInstance.sendTransacEmail(sendSmtpEmail)
}

module.exports = sendEmail