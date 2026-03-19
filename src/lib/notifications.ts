import { PrismaClient, Guest } from "@prisma/client";
import { sendEmail } from "./email";
import { sendSMS } from "./sms";

const prisma = new PrismaClient();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type NotificationType = "invite" | "reminder" | "thankyou";

export async function processNotifications(eventId: string, type: NotificationType) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { guests: true },
  });

  if (!event) throw new Error("Event not found");

  let guestsToNotify = event.guests;

  // Filter based on notification type
  if (type === "invite") {
    // Usually sent to everyone, or only those who haven't received it. 
    // For MVP, we'll just send to all pending.
    guestsToNotify = event.guests.filter((g: Guest) => g.rsvpStatus === "pending");
  } else if (type === "reminder") {
    // Send to pending
    guestsToNotify = event.guests.filter((g: Guest) => g.rsvpStatus === "pending");
  } else if (type === "thankyou") {
    // Send to yes
    guestsToNotify = event.guests.filter((g: Guest) => g.rsvpStatus === "yes");
  }

  const results = [];

  for (const guest of guestsToNotify) {
    const inviteLink = `${APP_URL}/invite/${guest.token}`;
    let emailStatus = "skipped";
    let smsStatus = "skipped";

    // 1. Send Email
    if (guest.email) {
      try {
        const { subject, html } = getEmailTemplate(type, event.title, guest.name, inviteLink);
        await sendEmail({ to: guest.email, subject, html });
        emailStatus = "sent";
        
        await prisma.notification.create({
          data: {
            type,
            channel: "email",
            status: "sent",
            sentAt: new Date(),
            guestId: guest.id,
            eventId: event.id,
          }
        });
      } catch (error: any) {
        emailStatus = `failed: ${error.message}`;
        await prisma.notification.create({
          data: { type, channel: "email", status: "failed", error: error.message, guestId: guest.id, eventId: event.id }
        });
      }
    }

    // 2. Send SMS
    if (guest.phone) {
      try {
        const body = getSMSTemplate(type, event.title, guest.name, inviteLink);
        await sendSMS({ to: guest.phone, body });
        smsStatus = "sent";
        
        await prisma.notification.create({
          data: {
            type,
            channel: "sms",
            status: "sent",
            sentAt: new Date(),
            guestId: guest.id,
            eventId: event.id,
          }
        });
      } catch (error: any) {
        smsStatus = `failed: ${error.message}`;
        await prisma.notification.create({
          data: { type, channel: "sms", status: "failed", error: error.message, guestId: guest.id, eventId: event.id }
        });
      }
    }

    results.push({ guest: guest.name, email: emailStatus, sms: smsStatus });
  }

  return results;
}

function getEmailTemplate(type: NotificationType, eventTitle: string, guestName: string, link: string) {
  switch (type) {
    case "invite":
      return {
        subject: `You're invited: ${eventTitle}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #8b5cf6;">Hi ${guestName},</h2>
            <p>You're invited to <strong>${eventTitle}</strong>!</p>
            <p>We'd love for you to join us. Please click the link below to view the event details and let us know if you can make it.</p>
            <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; margin-top: 10px;">View Invitation & RSVP</a>
          </div>
        `
      };
    case "reminder":
      return {
        subject: `Reminder: RSVP for ${eventTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #f59e0b;">Hi ${guestName},</h2>
            <p>We're finalizing the guest list for <strong>${eventTitle}</strong> and noticed you haven't RSVP'd yet.</p>
            <p>Please let us know if you can make it as soon as possible.</p>
            <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; margin-top: 10px;">RSVP Now</a>
          </div>
        `
      };
    case "thankyou":
      return {
        subject: `Thank you from ${eventTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">Hi ${guestName},</h2>
            <p>Thanks for a wonderful time at <strong>${eventTitle}</strong>!</p>
            <p>We appreciate you celebrating with us.</p>
          </div>
        `
      };
  }
}

function getSMSTemplate(type: NotificationType, eventTitle: string, guestName: string, link: string) {
  switch (type) {
    case "invite":
      return `Hi ${guestName}, you're invited to ${eventTitle}! View details and RSVP here: ${link}`;
    case "reminder":
      return `Hi ${guestName}, please don't forget to RSVP for ${eventTitle} here: ${link}`;
    case "thankyou":
      return `Hi ${guestName}, thanks for coming to ${eventTitle}! We had a great time.`;
  }
}
