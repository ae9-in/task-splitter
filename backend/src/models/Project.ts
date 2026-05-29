import mongoose, { Schema, Document } from 'mongoose';

// ─── Task ─────────────────────────────────────────────────────────────────────
export interface ITask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'frontend' | 'backend' | 'database' | 'devops' | 'design' | 'testing';
  order: number;
}

const TaskSchema = new Schema<ITask>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    type: {
      type: String,
      enum: ['frontend', 'backend', 'database', 'devops', 'design', 'testing'],
      default: 'backend',
    },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Feature ──────────────────────────────────────────────────────────────────
export interface IFeature {
  id: string;
  name: string;
  description: string;
  order: number;
  tasks: ITask[];
}

const FeatureSchema = new Schema<IFeature>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    tasks: [TaskSchema],
  },
  { _id: false }
);

// ─── Module ───────────────────────────────────────────────────────────────────
export interface IModule {
  id: string;
  name: string;
  description: string;
  order: number;
  features: IFeature[];
}

const ModuleSchema = new Schema<IModule>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    features: [FeatureSchema],
  },
  { _id: false }
);

// ─── Project ──────────────────────────────────────────────────────────────────
export interface IProject extends Document {
  title: string;
  description: string;
  requirementText: string;
  status: 'draft' | 'in-progress' | 'complete';
  modules: IModule[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    requirementText: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'in-progress', 'complete'],
      default: 'draft',
    },
    modules: [ModuleSchema],
  },
  {
    timestamps: true,
  }
);

// Index for faster listing queries
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ status: 1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
