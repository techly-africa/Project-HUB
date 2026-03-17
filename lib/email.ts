import sgMail from "@sendgrid/mail";

const FROM_EMAIL = "noreply@avel.africa";
const FROM_NAME  = "Project Hub";

sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "");

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("[email] SENDGRID_API_KEY not set, skipping email to", to);
    return;
  }
  await sgMail.send({
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    html,
  });
}

// ─── Email templates ──────────────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="background-color:#020617;padding:40px 20px;">
    <div style="max-width:560px;margin:0 auto;background-color:#0f172a;border-radius:24px;overflow:hidden;border:1px solid #334155;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #7c3aed 0%, #00c9b1 100%);padding:40px;text-align:center;">
        <span style="color:#ffffff;font-weight:900;font-size:24px;letter-spacing:-1px;text-transform:uppercase;">Project Hub</span>
        <div style="color:rgba(255,255,255,0.7);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin-top:8px;">Management Suite</div>
      </div>
      
      <!-- Body -->
      <div style="padding:48px;color:#f1f5f9;">
        ${content}
      </div>
      
      <!-- Footer -->
      <div style="padding:32px 48px;background-color:#020617;border-top:1px solid #1e293b;text-align:center;">
        <p style="color:#64748b;font-size:12px;margin:0;line-height:1.6;">
          &copy; ${new Date().getFullYear()} Project Hub. All rights reserved.<br>
          <span style="color:#475569;font-size:10px;">This is an automated notification. Please do not reply to this email.</span>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function taskAssignedEmail(opts: {
  recipientName: string;
  taskName: string;
  projectName: string;
  assignedByName: string;
  appUrl: string;
}) {
  return baseTemplate(`
    <p style="color:#64748b;font-size:14px;margin:0 0 8px">Hi ${opts.recipientName},</p>
    <h2 style="color:#0f172a;font-size:20px;font-weight:900;margin:0 0 16px">You've been assigned a task</h2>
    <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="color:#0f172a;font-weight:700;font-size:15px;margin:0 0 4px">${opts.taskName}</p>
      <p style="color:#64748b;font-size:13px;margin:0">in <strong>${opts.projectName}</strong> · assigned by ${opts.assignedByName}</p>
    </div>
    <a href="${opts.appUrl}" style="background:#00c9b1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:900;font-size:13px;letter-spacing:.5px">View Task →</a>
  `);
}

export function taskCommentEmail(opts: {
  recipientName: string;
  commenterName: string;
  taskName: string;
  comment: string;
  appUrl: string;
}) {
  return baseTemplate(`
    <p style="color:#64748b;font-size:14px;margin:0 0 8px">Hi ${opts.recipientName},</p>
    <h2 style="color:#0f172a;font-size:20px;font-weight:900;margin:0 0 16px">New comment on your task</h2>
    <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px">${opts.taskName}</p>
      <p style="color:#0f172a;font-size:14px;margin:0"><strong>${opts.commenterName}:</strong> ${opts.comment}</p>
    </div>
    <a href="${opts.appUrl}" style="background:#00c9b1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:900;font-size:13px;letter-spacing:.5px">View Task →</a>
  `);
}

export function taskStatusEmail(opts: {
  recipientName: string;
  taskName: string;
  newStatus: string;
  updatedByName: string;
  appUrl: string;
}) {
  const statusLabel: Record<string, string> = {
    completed: "Completed",
    in_progress: "In Progress",
    blocked: "Blocked",
    critical: "Critical",
    not_started: "Not Started",
    not_applicable: "Not Applicable",
  };
  return baseTemplate(`
    <p style="color:#64748b;font-size:14px;margin:0 0 8px">Hi ${opts.recipientName},</p>
    <h2 style="color:#0f172a;font-size:20px;font-weight:900;margin:0 0 16px">Task status updated</h2>
    <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="color:#0f172a;font-weight:700;font-size:15px;margin:0 0 4px">${opts.taskName}</p>
      <p style="color:#64748b;font-size:13px;margin:0">Status changed to <strong>${statusLabel[opts.newStatus] ?? opts.newStatus}</strong> by ${opts.updatedByName}</p>
    </div>
    <a href="${opts.appUrl}" style="background:#00c9b1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:900;font-size:13px;letter-spacing:.5px">View Task →</a>
  `);
}

export function taskMentionEmail(opts: {
  recipientName: string;
  mentionerName: string;
  taskName: string;
  comment: string;
  appUrl: string;
}) {
  return baseTemplate(`
    <p style="color:#64748b;font-size:14px;margin:0 0 8px">Hi ${opts.recipientName},</p>
    <h2 style="color:#0f172a;font-size:20px;font-weight:900;margin:0 0 16px">You were mentioned in a comment</h2>
    <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px">${opts.taskName}</p>
      <p style="color:#0f172a;font-size:14px;margin:0"><strong>${opts.mentionerName}:</strong> ${opts.comment}</p>
    </div>
    <a href="${opts.appUrl}" style="background:#00c9b1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:900;font-size:13px;letter-spacing:.5px">View Task →</a>
  `);
}

export function inviteEmail(opts: {
  orgName: string;
  inviteLink: string;
}) {
  return baseTemplate(`
    <h1 style="color:#ffffff;font-size:24px;font-weight:900;margin:0 0 16px;text-align:center;letter-spacing:-0.5px;">Welcome to the Team!</h1>
    <p style="color:#94a3b8;font-size:16px;line-height:1.6;margin:0 0 32px;text-align:center;">
      You've been invited to join <strong style="color:#ffffff;">${opts.orgName}</strong> on Project Hub. 
    </p>
    
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${opts.inviteLink}" style="display:inline-block;background:#00c9b1;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:14px;font-weight:900;font-size:15px;letter-spacing:0.5px;box-shadow:0 10px 15px -3px rgba(0,201,177,0.3);">
        Accept Invitation &rarr;
      </a>
    </div>
    
    <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;padding:20px;text-align:center;">
      <p style="color:#64748b;font-size:12px;margin:0;">
        This invitation link expires in <strong style="color:#94a3b8;">24 hours</strong>.<br>
        If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>
  `);
}

export function passwordResetEmail(opts: {
  recipientName: string;
  resetLink: string;
}) {
  return baseTemplate(`
    <p style="color:#64748b;font-size:14px;margin:0 0 8px">Hi ${opts.recipientName},</p>
    <h2 style="color:#0f172a;font-size:20px;font-weight:900;margin:0 0 12px">Reset your password</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px">Click the button below to set a new password. This link expires in 1 hour.</p>
    <a href="${opts.resetLink}" style="background:#0a1628;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:900;font-size:13px;letter-spacing:.5px">Reset Password →</a>
  `);
}
