// Multi-channel communications library
// Dependencies: npm install twilio nodemailer
const twilio = require("twilio");
const nodemailer = require("nodemailer");

// Twilio Configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// SendGrid/Email Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendSMS(phoneNumber: string, message: string) {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error("SMS send failed:", error);
    throw error;
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
) {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });
    return {
      success: true,
      messageId: result.messageId,
      status: "sent",
    };
  } catch (error) {
    console.error("Email send failed:", error);
    throw error;
  }
}

export async function sendWhatsApp(
  phoneNumber: string,
  message: string,
  mediaUrl?: string,
) {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phoneNumber}`,
      ...(mediaUrl && { mediaUrl: [mediaUrl] }),
    });
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error("WhatsApp send failed:", error);
    throw error;
  }
}

// Template rendering
export function renderAppointmentReminder(
  patientName: string,
  appointmentTime: Date,
  providerName: string,
) {
  const time = appointmentTime.toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    sms: `Hi ${patientName}, reminder: you have an appointment with ${providerName} on ${time}. Reply CONFIRM to confirm or CANCEL to cancel.`,
    email: `
      <h2>Appointment Reminder</h2>
      <p>Hi ${patientName},</p>
      <p>This is a reminder about your upcoming appointment:</p>
      <ul>
        <li><strong>Provider:</strong> ${providerName}</li>
        <li><strong>Date & Time:</strong> ${time}</li>
      </ul>
      <p>Please reply if you need to reschedule.</p>
    `,
  };
}

export function renderCampaignMessage(
  patientName: string,
  campaignName: string,
  content: string,
) {
  return {
    sms: `Hi ${patientName}, ${content}`,
    email: `
      <h2>${campaignName}</h2>
      <p>Hi ${patientName},</p>
      <p>${content}</p>
    `,
  };
}
