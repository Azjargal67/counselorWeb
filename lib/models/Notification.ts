import { Schema, model, models, Types } from "mongoose"

const NotificationSchema = new Schema({
  userId:  { type: Types.ObjectId, ref: "User", required: true, index: true },
  type:    { type: String, enum: ["task", "recommendation", "chat", "admission"], required: true },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
  link:    { type: String, default: "" },
}, {
  timestamps: true,
  toJSON: {
    transform(_, ret) {
      ret.id = ret._id.toString()
      ret.userId = ret.userId?.toString()
      delete ret._id; delete ret.__v
    }
  }
})

export const Notification = models.Notification || model("Notification", NotificationSchema)
