import { Schema, model, models } from "mongoose"

const TenantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    plan: { type: String, enum: ["Basic", "Pro", "Enterprise"], required: true },
    status: { type: String, enum: ["pending_payment", "active", "expiring", "inactive"], default: "pending_payment" },
    adminEmail: { type: String, default: "" },
    counselorCount: { type: Number, default: 0 },
    studentCount: { type: Number, default: 0 },
    storageUsed: { type: String, default: "0 GB" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(_: unknown, ret: any) {
        ret.id = ret._id?.toString()
        delete ret._id
        delete ret.__v
      },
    },
  }
)

export const Tenant = models.Tenant || model("Tenant", TenantSchema)
