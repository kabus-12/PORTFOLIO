const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.daum.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});
// transporter.sendMail(
//   {
//     from: "jcwo1213@daum.net",
//     to: "jcwo1213@daum.net",
//     subject: "test",
//     text: "test",
//   },
//   (err, info) => {
//     // if (err) console.log(err);
//     // console.log(info);
//   },
// );
// console.log("sendMail start");
module.exports = transporter;
