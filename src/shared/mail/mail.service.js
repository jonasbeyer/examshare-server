const nodemailer = require("nodemailer"),
  Email = require("email-templates"),
  tokenService = require("../token/token.service"),
  transporter = setupTransporter(),
  sender = "ExamShare <noreply@" + __config.baseUrl() + ">";

async function send(type, user, newEmail) {
  const emailAddress = (newEmail || user.email).trim();
  const email = new Email({
    message: { from: sender, to: emailAddress, subject: type.getSubject() },
    send: true,
    transport: transporter,
    views: {
      root: __basePath + "/views/mail",
      options: { extension: "ejs" },
    },
  });

  return email.send({
    template: type.getType(),
    locals: {
      email: email,
      username: user.Username,
      link: await type.getTokenURL(user, newEmail),
    },
  });
}

function setupTransporter() {
  return nodemailer.createTransport({
    host: __config.smtp.host,
    port: __config.smtp.port,
    auth: {
      user: __config.smtp.user,
      pass: __config.smtp.password,
    },
    secure: true,
  });
}

class MailType {
  constructor(type, subject, generateToken = true) {
    this.type = type;
    this.subject = subject;
    this.generateToken = generateToken;
  }

  getType() {
    return this.type;
  }

  getSubject() {
    return this.subject;
  }

  async getTokenURL(user, newEmail) {
    if (this.generateToken) {
      const token = await tokenService.generateToken(
        this.type,
        user._id,
        newEmail,
      );
      return (
        __config.baseUrl("https") +
        "/verify/email/" +
        token.Token +
        "?userId=" +
        user._id
      );
    }
    return undefined;
  }
}

module.exports = {
  send: send,
  REGISTRATION: new MailType("Registration", "Kontoaktivierung"),
  VERIFICATION: new MailType(
    "Verification",
    "Bestätigung der neuen E-Mail-Adresse",
  ),
  DEACTIVATION: new MailType("Deactivation", "Kontodeaktivierung", false),
  RESET_PASS: new MailType("Reset", "Anfrage zum Zurücksetzen des Passwortes"),
};
