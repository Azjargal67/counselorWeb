import { Schema, model, models } from "mongoose"

const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: {
    transform(_, ret) {
      ret.id = ret._id.toString()
      delete ret._id; delete ret.__v
    }
  }
})

export const Message = models.Message || model("Message", MessageSchema)
