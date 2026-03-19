"""Email service for sending OTP via SMTP. Requires MAIL_SERVER, MAIL_USERNAME, MAIL_PASSWORD to be configured."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app


def is_email_configured():
    """Check if SMTP is configured for sending emails."""
    return bool(
        current_app.config.get("MAIL_SERVER")
        and current_app.config.get("MAIL_USERNAME")
        and current_app.config.get("MAIL_PASSWORD")
    )


def send_email_message(to_email: str, subject: str, text: str, html: str) -> bool:
    if not is_email_configured():
        current_app.logger.warning("Email send skipped because SMTP is not configured.")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = current_app.config.get("MAIL_DEFAULT_SENDER", "noreply@coreinventory.com")
        msg["To"] = to_email

        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(
            current_app.config["MAIL_SERVER"],
            current_app.config.get("MAIL_PORT", 587),
        ) as server:
            if current_app.config.get("MAIL_USE_TLS", True):
                server.starttls()
            server.login(
                current_app.config["MAIL_USERNAME"],
                current_app.config["MAIL_PASSWORD"],
            )
            server.send_message(msg)
        return True
    except Exception:
        current_app.logger.exception(
            "Failed to send email to %s using SMTP server %s",
            to_email,
            current_app.config.get("MAIL_SERVER"),
        )
        return False


def send_otp_email(to_email: str, otp: str, subject: str = "Your Login Verification Code", purpose: str = "verification") -> bool:
    """
    Send OTP via email. Returns True if sent, False otherwise.
    When email is not configured, does nothing (caller should return OTP in response for dev).
    """
    text = (
        f"Your CoreInventory {purpose} code is: {otp}\n\n"
        "This code expires in 10 minutes.\n\n"
        "If you didn't request this, please ignore this email."
    )
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #1e293b;">
        <p>Your CoreInventory {purpose} code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 0.35rem;">{otp}</p>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
    </body>
    </html>
    """
    return send_email_message(to_email, subject, text, html)
