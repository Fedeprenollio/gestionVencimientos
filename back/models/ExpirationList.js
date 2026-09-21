import mongoose from "mongoose";

const expirationListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// No permitir dos listas con el mismo nombre dentro de una sucursal
expirationListSchema.index(
  { branch: 1, name: 1 },
  { unique: true }
);

export default mongoose.model("ExpirationList", expirationListSchema);