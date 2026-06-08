import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  specialty: string;
  experience: number;
  bio: string;
  hospital: string;
  location: {
    city: string;
    district: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  workingHours: {
    day: string;
    start: string;
    end: string;
    isAvailable: boolean;
  }[];
  rating: number;
  reviewCount: number;
  consultationFee: number;
  isAvailable: boolean;
}

const DoctorSchema = new Schema<IDoctor>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  specialty:   { type: String, required: true },
  experience:  { type: Number, required: true },
  bio:         { type: String },
  hospital:    { type: String },
  location: {
    city:     { type: String },
    district: { type: String },
    address:  { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  workingHours: [{
    day:         { type: String },
    start:       { type: String },
    end:         { type: String },
    isAvailable: { type: Boolean, default: true },
  }],
  rating:          { type: Number, default: 0 },
  reviewCount:     { type: Number, default: 0 },
  consultationFee: { type: Number, default: 0 },
  isAvailable:     { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);