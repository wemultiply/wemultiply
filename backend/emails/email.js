import nodemailer from 'nodemailer';
import { emailTemplate } from './emailTemplate.js';
import { welcomeTemplate } from './welcomeTemplate.js';


// Reusable transporter with connection pooling enabled
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // SMTP host
    port: 587, // SMTP port
    secure: false, // Use TLS (false for 587)
    auth: {
        user: 'wemultiply27@gmail.com', // SMTP username
        pass: 'wduwibrzhmaedjgv', // SMTP password
    },
    pool: true, // Enable connection pooling
    maxConnections: 5, // Max number of connections
    maxMessages: 100, // Max messages per connection
    debug: false, // Disable debugging logs for faster execution
    logger: false, // Disable logging to save on performance
});

// Send Verification Email
export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const mailOptions = {
            from: 'weMultiply <wemultiply27@gmail.com>', // Sender address
            to: email, // Recipient's email
            subject: 'Email Verification', // Subject
            html: emailTemplate.replace('{verificationToken}', verificationToken), // HTML body
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return { status: 'success', message: 'Verification email sent successfully' };
    } catch (error) {
        console.error('Error sending verification email:', error);
        return { status: 'error', message: 'Failed to send verification email', error: error.message };
    }
};

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: 'weMultiply <wemultiply27@gmail.com>', // Sender address
            to: email, // Recipient's email
            subject: 'Welcome to GET International', // Subject
            html: welcomeTemplate.replace('{name}', name), // HTML body
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { status: 'success', message: 'Welcome email sent successfully' };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { status: 'error', message: 'Failed to send welcome email', error: error.message };
    }
};

// Example of sending emails to multiple recipients
export const sendBulkEmails = async (emails, verificationToken) => {
    try {
        // Using Promise.all to send emails in parallel for faster execution
        const emailPromises = emails.map(email =>
            sendVerificationEmail(email, verificationToken)
        );
        // Wait for all emails to be sent
        await Promise.all(emailPromises);

        return { status: 'success', message: 'All emails sent successfully' };
    } catch (error) {
        console.error('Error sending bulk emails:', error);
        return { status: 'error', message: 'Failed to send bulk emails', error: error.message };
    }
};

export const sendPasswordResetEmail = async (email, reset_url) => {
    try {
        const mailOptions = {
            from: 'weMultiply <wemultiply27@gmail.com>', // Sender address
            to: email, // Recipient's email
            subject: 'Welcome to GET International', // Subject
            html: `Click <a href="${reset_url}">to reset your password</a>`, // HTML body
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { status: 'success', message: 'Welcome email sent successfully' };

    } catch (error) {

    }
}
export const sendResetSuccessEmail = async (email) => {
    try {
        const mailOptions = {
            from: 'weMultiply <wemultiply27@gmail.com>', // Sender address
            to: email, // Recipient's email
            subject: 'Password Reset | GET International', // Subject
            html: `You have successfully reset your password</a>`, // HTML body
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { status: 'success', message: 'reset password email sent successfully' };
    } catch (error) {
        console.log(error)
    }

}