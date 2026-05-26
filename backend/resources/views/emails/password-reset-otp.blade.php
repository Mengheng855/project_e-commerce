<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password reset OTP</title>
</head>
<body style="margin:0;background:#f4f7f6;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f6;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dbe7e4;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="background:#0f766e;padding:28px 32px;color:#ffffff;">
                            <div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;">TosTinh</div>
                            <div style="margin-top:8px;font-size:14px;font-weight:600;color:#d8f3ef;">Password reset request</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0;font-size:24px;line-height:1.3;color:#0f172a;">Use this OTP to reset your password</h1>
                            <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#475569;">
                                We received a request to reset the password for your TosTinh account. Enter this code in the reset password page.
                            </p>

                            <div style="margin:28px 0;padding:22px;border:1px solid #99d8cf;border-radius:10px;background:#ecfdf9;text-align:center;">
                                <div style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#0f766e;">Your OTP code</div>
                                <div style="margin-top:10px;font-size:38px;line-height:1;font-weight:900;letter-spacing:0.18em;color:#0f172a;">{{ $otp }}</div>
                            </div>

                            <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
                                This code expires in <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top:1px solid #e2e8f0;padding:20px 32px;background:#fbfdfc;">
                            <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                                TosTinh security email. Please do not share this code with anyone.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
