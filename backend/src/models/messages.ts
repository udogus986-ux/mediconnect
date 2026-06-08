import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content:        { type: String, required: true },
  type:           { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  fileUrl:        { type: String },
  fileName:       { type: String },
  isRead:         { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);