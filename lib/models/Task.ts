import { Schema, model, models, Types } from "mongoose"

const TaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["essay", "cv", "transcript", "recommendation", "test-prep", "interview", "career-test", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done", "overdue"],
      default: "todo",
    },
    deadline: { type: Date, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    studentId: { type: Types.ObjectId, ref: "User", required: true },
    counselorId: { type: Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(_: unknown, ret: any) {
        ret.id = ret._id?.toString()
        ret.studentId = ret.studentId?.toString()
        ret.counselorId = ret.counselorId?.toString()
        delete ret._id
        delete ret.__v
      },
    },
  }
)

export const Task = models.Task || model("Task", TaskSchema)
