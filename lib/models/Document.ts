import { Schema, model, models, Types } from "mongoose"

const DocumentSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["essay", "cv", "transcript", "recommendation", "other"], required: true },
    size: { type: String },
    category: { type: String },
    version: { type: String, default: "v1" },
    url: { type: String },
    studentId: { type: Types.ObjectId, ref: "User", required: true },
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

export const Document = models.Document || model("Document", DocumentSchema)
