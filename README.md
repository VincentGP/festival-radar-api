# FestivalRadar API
The following explains different use cases for the FestivalRadar API

## Sending emails
To send emails you need to import the transporter object and then provide the details of the email you want to send. Lastly you need to invoke the *sendMail* method.

```javascript
const { transporter } = require('./mail/mail');

let mailOptions = {
  from: 'FestivalRadar',
  to: 'vgercke@gmail.com',
  subject: 'Velkommen!',
  html: '<p>Velkommen til FestivalRadar!</p>'
};

transporter.sendMail(mailOptions);
```