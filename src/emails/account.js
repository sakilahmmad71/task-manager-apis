const sgMail = require('@sendgrid/mail')
require('dotenv').config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to : email,
        from : 'sakilahmmad71@gmail.com',
        subject : 'Thanks for joining in!',
        text : `Welcome to the Task Manager app, ${name}. Let me know how you get along with the site.`
    })
}

const sendCancelMail = (email, name) => {
    sgMail.send({
        to : email,
        from : 'sakilahmmad71@gmail.com',
        subject : 'You are welcome at anytime in our service. Thanks!',
        text : `Good Bye, ${name}. Why you are actually cancelling our services!. Please let us know if our services has any problems including you. Thank you.`
    })
}

module.exports = {
    sendWelcomeMail,
    sendCancelMail
}