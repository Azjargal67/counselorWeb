import { Schema, model, models } from "mongoose"

const ConversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  lastMessage: { type: String, default: "" },
  lastMessageAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: {
    transform(_, ret) {
      ret.id = ret._id.toString()
      delete ret._id; delete ret.__v
    }
  }
})

export const Conversation = models.Conversation || model("Conversation", ConversationSchema)
