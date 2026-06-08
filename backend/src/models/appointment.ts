import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId:  { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date:      { type: Date, required: true },
  time:      { type: String, required: true },
  status:    { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  notes:     { type: String },
}, { timestamps: true });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);