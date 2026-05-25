import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Task } from "@/lib/models/Task"
import { User } from "@/lib/models/User"
import { sendDeadlineReminder } from "@/lib/email"

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const students = await User.find({ role: "student", emailReminders: true, status: "active" }).lean()

  let sent = 0
  const errors: string[] = []

  for (const student of students) {
    const reminderDays = (student as { reminderDays?: number }).reminderDays ?? 3
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + reminderDays)
    targetDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const tasks = await Task.find({
      studentId: student._id,
      status: { $in: ["todo", "in-progress"] },
      deadline: { $gte: targetDate, $lt: nextDay },
    }).lean()

    for (const task of tasks) {
      try {
        await sendDeadlineReminder({
          to: student.email,
          studentName: student.name,
          taskTitle: task.title,
          deadline: task.deadline as Date,
          daysLeft: reminderDays,
        })
        sent++
      } catch (e) {
        errors.push(`${student.email} - ${task.title}: ${e}`)
      }
    }
  }

  return NextResponse.json({ ok: true, sent, errors })
}
