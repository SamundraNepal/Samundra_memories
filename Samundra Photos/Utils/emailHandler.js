 const nodmailer = require('nodemailer');

const sendEmail = async (option) =>{


        //Create a transporter.
    const transporter = nodmailer.createTransport({
        service: process.env.HOST,
        auth :{
            user: process.env.HOST_USER_EMAIL,
            pass:process.env.HOST_USER_PASSWORD
        }
    })



        //Define email options.
const mailOptions = {from:`Memories<${process.env.HOST_USER_EMAIL}>`,
to:option.to,
subject:option.subject,
text:option.text}


//Send email
   await transporter.sendMail(mailOptions);
}


module.exports = sendEmail;