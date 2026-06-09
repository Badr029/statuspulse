const sgMail = require('@sendgrid/mail');



async function sendEmailAlert({monitor, status, latency_ms, error_message}) {

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const apikey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.ALERT_FROM_EMAIL;
    const toEmail = process.env.ALERT_TO_EMAIL;


if (!apikey || !fromEmail || !toEmail) {
    console.log('[email] missing SendGrid configuration, skipping email alert');
    return;
}

    const isDown = status === 'down';
    const subject = isDown 
        ? `ALERT DOWN : ${monitor.name} is not responding`
        : `RECOVERED : ${monitor.name} is back up`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${isDown ? '#dc2626' : '#16a34a'}; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">
            ${isDown ? 'Monitor Alert — Service Down' : 'Monitor Recovered'}
            </h1>
        </div>

        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 120px;">Monitor</td>
                <td style="padding: 8px 0; font-weight: bold;">${monitor.name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #6b7280;">URL</td>
                <td style="padding: 8px 0;">
                <a href="${monitor.url}" style="color: #2563eb;">${monitor.url}</a>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #6b7280;">Status</td>
                <td style="padding: 8px 0; font-weight: bold; color: ${isDown ? '#dc2626' : '#16a34a'};">
                ${isDown ? 'DOWN' : 'UP'}
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #6b7280;">Time</td>
                <td style="padding: 8px 0;">${new Date().toUTCString()}</td>
            </tr>
            ${latency_ms != null ? `
            <tr>
                <td style="padding: 8px 0; color: #6b7280;">Latency</td>
                <td style="padding: 8px 0;">${latency_ms}ms</td>
            </tr>` : ''}
            ${error_message ? `
            <tr>
                <td style="padding: 8px 0; color: #6b7280;">Error</td>
                <td style="padding: 8px 0; color: #dc2626;">${error_message}</td>
            </tr>` : ''}
            </table>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Sent by StatusPulse — your API health monitoring dashboard
            </p>
        </div>
        </div>
    `;

    const msg = {
        to: toEmail,
        from: fromEmail,
        subject,
        html,
        

        text: `${subject}\n\nMonitor: ${monitor.name}\nURL: ${monitor.url}\nStatus: ${status.toUpperCase()}\nTime: ${new Date().toUTCString()}${error_message ? `\nError: ${error_message}` : ''}`,
    }; 
    try {
        await sgMail.send(msg);
        console.log(`[email] sent email to ${toEmail} about monitor "${monitor.name}"`);
    }
    
    catch (err) {
        console.error('[email] error sending email alert', error.message);
        if (err.message){
            console.error('[email] SendGrid error details', error.response.body);
        }  
    }


}

module.exports ={sendEmailAlert};

