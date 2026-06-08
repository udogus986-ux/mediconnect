import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  avatar?: string
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
  googleId?: string
  facebookId?: string
  isOnline: boolean
  lastSeen: Date
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name:                 { type: String, required: true },
  email:                { type: String, required: true, unique: true },
  password:             { type: String },
  avatar:               { type: String },
  role:                 { type: String, enum: ['PATIENT', 'DOCTOR', 'ADMIN'], default: 'PATIENT' },
  googleId:             { type: String },
  facebookId:           { type: String },
  isOnline:             { type: Boolean, default: false },
  lastSeen:             { type: Date, default: Date.now },
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true })

export default mongoose.model<IUser>('User', UserSchema)