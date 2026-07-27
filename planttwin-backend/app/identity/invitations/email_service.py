import logging
from app.core.config.settings import settings

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_invitation_email(to_email: str, org_name: str, inviter_name: str, role: str, accept_url: str):
        """
        Sends an invitation email to a user.
        In development (EMAIL_USE_CONSOLE=True), prints to console.
        In production, would send via SMTP/SendGrid.
        """
        subject = f"You've been invited to join {org_name} on PlantTwin AI"
        
        body = f"""
        ======================================================================
        PLANTTWIN AI — INVITATION
        ======================================================================
        Hello,
        
        You have been invited by {inviter_name} to join {org_name} on PlantTwin AI 
        as a {role}.
        
        Please click the link below to accept your invitation and set up your account:
        {accept_url}
        
        This link will expire in {settings.INVITATION_EXPIRE_DAYS} days.
        ======================================================================
        """
        
        if settings.EMAIL_USE_CONSOLE:
            print("\n[EMAIL SIMULATION]")
            print(f"To: {to_email}")
            print(f"Subject: {subject}")
            print(body)
            logger.info(f"Simulated email sent to {to_email}")
        else:
            # TODO: Implement real SMTP sending here
            logger.warning("Real email sending is not implemented yet. Using console fallback.")
            print(f"\n[EMAIL SIMULATION - Fallback] To: {to_email}")
            print(body)
