import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendDeadlineReminder({
  to,
  studentName,
  taskTitle,
  deadline,
  daysLeft,
}: {
  to: string
  studentName: string
  taskTitle: string
  deadline: Date
  daysLeft: number
}) {
  const deadlineStr = new Date(deadline).toLocaleDateString("mn-MN", {
    year: "numeric", month: "long", day: "numeric",
  })

  await transporter.sendMail({
    from: `"EduCounsel" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⏰ Сануулга: "${taskTitle}" deadline ${daysLeft} өдрийн дараа`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
        <div style="background: #4361EE; border-radius: 10px; padding: 20px 24px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 20px;">EduCounsel</h1>
          <p style="color: #c7d2fe; margin: 4px 0 0; font-size: 13px;">Deadline сануулга</p>
        </div>
        <div style="background: white; border-radius: 10px; padding: 24px; border: 1px solid #e2e8f0;">
          <p style="color: #0f172a; font-size: 15px; margin: 0 0 16px;">Сайн байна уу, <strong>${studentName}</strong>!</p>
          <p style="color: #475569; font-size: 14px; margin: 0 0 20px;">Таны дараах даалгаврын deadline ойртож байна:</p>
          <div style="background: #f0f3ff; border-left: 4px solid #4361EE; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px;">
            <p style="color: #0f172a; font-weight: bold; font-size: 15px; margin: 0 0 6px;">${taskTitle}</p>
            <p style="color: #4361EE; font-size: 13px; margin: 0;">📅 Deadline: ${deadlineStr}</p>
            <p style="color: #e53e3e; font-size: 13px; font-weight: bold; margin: 6px 0 0;">⏰ ${daysLeft} өдрийн дараа дуусна!</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/student/tasks"
             style="display: inline-block; background: #4361EE; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Даалгавар харах →
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">
          Энэ мэйлийг EduCounsel системээс автоматаар илгээсэн болно.
        </p>
      </div>
    `,
  })
}
