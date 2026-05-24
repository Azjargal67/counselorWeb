import { Schema, model, models } from "mongoose"

const CareerTestResultSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    hollandCode: { type: String, required: true },
    scores: {
      R: { type: Number, default: 0 },
      I: { type: Number, default: 0 },
      A: { type: Number, default: 0 },
      S: { type: Number, default: 0 },
      E: { type: Number, default: 0 },
      C: { type: Number, default: 0 },
    },
    completedAt: { type: Date, default: Date.now },
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
      },
    },
  }
)

export const CareerTestResult = models.CareerTestResult || model("CareerTestResult", CareerTestResultSchema)
