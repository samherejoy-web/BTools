import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import secrets
import os
from typing import Optional

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "rohushanshinde@gmail.com"
SMTP_PASSWORD = "pajbdmcpcegppguz"
FROM_EMAIL = "rohushanshinde@gmail.com"
FROM_NAME = "MarketMind"

# Base URL for frontend - get from environment or use default
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

def send_email(to_email: str, subject: str, body: str) -> bool:
    """Send email using Gmail SMTP"""
    try:
        # Create message
        message = MIMEMultipart()
        message["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        # Add body to email
        message.attach(MIMEText(body, "plain"))
        
        # Create SMTP session
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # Enable TLS
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        
        # Send email
        text = message.as_string()
        server.sendmail(FROM_EMAIL, to_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

def generate_verification_token() -> str:
    """Generate a secure verification token"""
    return secrets.token_urlsafe(32)

def get_verification_expiry() -> datetime:
    """Get verification expiry time (1 hour from now)"""
    return datetime.utcnow() + timedelta(hours=1)

def send_verification_email(to_email: str, username: str, verification_token: str) -> bool:
    """Send email verification email"""
    verification_url = f"{FRONTEND_URL}/verify-email?token={verification_token}"
    
    subject = "Verify your MarketMind account"
    
    body = f"""
Hello {username},

Welcome to MarketMind! Please verify your email address to complete your account setup.

Click the link below to verify your email address:
{verification_url}

This verification link will expire in 1 hour.

If you didn't create an account with MarketMind, please ignore this email.

Best regards,
The MarketMind Team
    """
    
    return send_email(to_email, subject, body)

def send_verification_success_email(to_email: str, username: str) -> bool:
    """Send email verification success confirmation"""
    subject = "Email verified successfully - MarketMind"
    
    body = f"""
Hello {username},

Great news! Your email address has been successfully verified.

You can now log in to your MarketMind account and start exploring amazing tools.

Login here: {FRONTEND_URL}/login

Welcome to the MarketMind community!

Best regards,
The MarketMind Team
    """
    
    return send_email(to_email, subject, body)