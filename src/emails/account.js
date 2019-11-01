const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const fromEmail = 'matthewpolsom@hotmail.com';

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: fromEmail,
        subject: 'Welcome to Task App!',
        text: `Welcome to the app, ${name}. Let me know how you find the app.`,
    });
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: fromEmail,
        subject: 'Sorry to see you go',
        text: `We're sorry to see that you're leaving Task App, ${name}. If you wouldn't mind, please let us know why you're leaving.`,
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail,
};
