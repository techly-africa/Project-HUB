import sgMail from "@sendgrid/mail";

const FROM_EMAIL = "noreply@avel.africa";
const FROM_NAME  = "Rukisha Project Tracker";

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
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <div style="background:#0a1628;padding:28px 32px">
      <span style="color:#00c9b1;font-weight:900;font-size:18px;letter-spacing:-0.5px">RUKISHA</span>
      <span style="color:rgba(255,255,255,.3);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-left:12px">Project Tracker</span>
    </div>
    <div style="padding:32px">${content}</div>
    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9">
      <p style="color:#94a3b8;font-size:11px;margin:0">This is an automated notification from Rukisha Project Tracker.</p>
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
    <h2 style="color:#0f172a;font-size:20px;font-weight:900;margin:0 0 12px">You've been invited to ${opts.orgName}</h2>
    <p style="color:#64748b;font-size:14px;margin:0 0 24px">Click the button below to set your password and access the project tracker.</p>
    <a href="${opts.inviteLink}" style="background:#00c9b1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:900;font-size:13px;letter-spacing:.5px">Accept Invitation →</a>
    <p style="color:#94a3b8;font-size:12px;margin-top:20px">This invitation link expires in 24 hours.</p>
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
