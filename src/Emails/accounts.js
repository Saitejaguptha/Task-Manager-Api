const nodemailer = require("nodemailer");
require("dotenv").config({ path: "../../dot.env" });

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.MAILPORT,
  auth: {
    user: process.env.MAILTRAPUSER,
    pass: process.env.MAILTRAPPASS,
  },
});

const sendmail = async (email, name, subject, body) => {
  try {
    const info = await transporter.sendMail({
      from: "saitejguptha111@gmail.com",
      to: email,
      subject: subject,
      text: `Welcome To the App ${name}\n\n\n${body} \n\nThanks\nTask Manager Api`,
    });
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendmail };
