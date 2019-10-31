const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
(function(){
    const api = {
        ClientID: process.env.ClientID,
        ClientSecret: process.env.ClientSecret,
        url: process.env.url,
        RefreshToken: process.env.RefreshToken,
        author: process.env.author
    }
    const oauth2Client = new OAuth2(
        api.ClientID, // ClientID
        api.ClientSecret, // Client Secret
        api.url // Redirect URL
    );
    oauth2Client.setCredentials({
        refresh_token: api.RefreshToken
    });
    const accessToken = oauth2Client.getAccessToken()
    const smtpTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: "OAuth2",
            user: api.author, 
            clientId: api.ClientID,
            clientSecret: api.ClientSecret,
            refreshToken: api.RefreshToken,
            accessToken
        }
    });
    const sendWelcome = (email, name ) => {
        const mailOptions = {
            from: 'robertkwan.rk@gmail.com',
            to: email,
            subject: 'Thanks for joining us!',
            text: `Welcome to the app, ${name}. Let us know about the app!`
        }
        smtpTransport.sendMail(mailOptions, (error, response) => {
            smtpTransport.close();
        })
    }
    const sendGoodbye = (email, name) => {
        const mailOptions = {
            from: 'robertkwan.rk@gmail.com',
            to: email,
            subject: 'Are you leaving?',
            text: `Hello, ${name}. We're so sorry for your leaving. We hope to see you again!`
        }
        smtpTransport.sendMail(mailOptions, (error, response) => {
            smtpTransport.close();
        })
    }
    
    module.exports = {
        sendWelcome,
        sendGoodbye
    }
})()



