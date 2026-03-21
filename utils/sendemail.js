const SibApiV3Sdk = require('sib-api-v3-sdk')

const defaultClient = SibApiV3Sdk.ApiClient.instance
const apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.BREVO_API_KEY

const sendEmail = async ({ to, subject, html }) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

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