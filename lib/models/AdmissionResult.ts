import { Schema, model, models, Types } from "mongoose"

const AdmissionResultSchema = new Schema(
  {
    studentId: { type: Types.ObjectId, ref: "User", required: true },
    schoolName: { type: String, required: true, trim: true },
    country: { type: String, default: "" },
    status: {
      type: String,
      enum: ["accepted", "waitlisted", "rejected", "deferred"],
      required: true,
    },
    scholarshipPercent: { type: Number, default: 0, min: 0, max: 100 },
    scholarshipAmount: { type: Number, default: 0, min: 0 },
    currency: { type: String, enum: ["MNT", "USD", "GBP", "AUD", "KRW"], default: "MNT" },
    major: { type: String, default: "" },
    notes: { type: String, default: "" },
    resultDate: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(_: unknown, ret: any) {
        ret.id = ret._id?.toString()
        ret.studentId = ret.studentId?.toString()
        delete ret._id
        delete ret.__v
      },
    },
  }
)

export const AdmissionResult = models.AdmissionResult || model("AdmissionResult", AdmissionResultSchema)
