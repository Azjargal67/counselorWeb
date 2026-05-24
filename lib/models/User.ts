import { Schema, model, models } from "mongoose"

export type Role = "student" | "counselor" | "teacher" | "admin" | "super-admin"

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "counselor", "teacher", "admin", "super-admin"],
      required: true,
    },
    grade: { type: String },
    school: { type: String },
    phone: { type: String },
    gpa: { type: Number },
    sat: { type: Number },
    academicHistory: [{
      gradeYear: { type: String, enum: ["10", "11", "12"] },
      gpa:   { type: Number },
      sat:   { type: Number },
      act:   { type: Number },
      toefl: { type: Number },
      ielts: { type: Number },
    }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(_: unknown, ret: any) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.password
      },
    },
  }
)

export const User = models.User || model("User", UserSchema)
