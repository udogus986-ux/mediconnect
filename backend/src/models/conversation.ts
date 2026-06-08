import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants:  [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastMessage:   { type: Schema.Types.ObjectId, ref: 'Message' },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
}, { timestamps: true });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);