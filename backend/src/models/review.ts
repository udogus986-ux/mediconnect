import mongoose, { Document, Schema } from 'mongoose'

export interface IReview extends Document {
  doctorId: mongoose.Types.ObjectId
  patientId: mongoose.Types.ObjectId
  appointmentId: mongoose.Types.ObjectId
  communicationRating: number  // İletişim
  expertiseRating: number      // Uzmanlık
  punctualityRating: number    // Dakiklik
  averageRating: number        // Ortalama
  createdAt: Date
}

const ReviewSchema = new Schema<IReview>({
  doctorId:             { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientId:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId:        { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
  communicationRating:  { type: Number, required: true, min: 1, max: 5 },
  expertiseRating:      { type: Number, required: true, min: 1, max: 5 },
  punctualityRating:    { type: Number, required: true, min: 1, max: 5 },
  averageRating:        { type: Number, required: true },
}, { timestamps: true })

export default mongoose.model<IReview>('Review', ReviewSchema)