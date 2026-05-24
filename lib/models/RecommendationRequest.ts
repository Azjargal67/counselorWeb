import { Schema, model, models, Types } from "mongoose"

const RecommendationRequestSchema = new Schema(
  {
    studentId:   { type: Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    teacherId:   { type: Types.ObjectId, ref: "User", required: true },
    teacherName: { type: String, required: true },
    school:      { type: String, required: true },
    deadline:    { type: Date, required: true },
    status:      { type: String, enum: ["pending", "writing", "sent", "rejected"], default: "pending" },
    message:     { type: String },
    notes:       { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(_: unknown, ret: any) {
        ret.id = ret._id?.toString()
        ret.studentId = ret.studentId?.toString()
        ret.teacherId = ret.teacherId?.toString()
        ret.deadline = ret.deadline?.toISOString?.() ?? ret.deadline
        delete ret._id
        delete ret.__v
      },
    },
  }
)

export const RecommendationRequest = models.RecommendationRequest || model("RecommendationRequest", RecommendationRequestSchema)
