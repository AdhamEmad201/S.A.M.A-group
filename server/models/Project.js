const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'عقارات',
    },
    status: {
      type: String,
      enum: ['متاح', 'مباع', 'قيد الإنشاء'],
      default: 'متاح',
    },
    images: [
      {
        url: String,
        filename: String,
      },
    ],
    videos: [
      {
        type: {
          type: String,
          enum: ['upload', 'link'],
          default: 'link',
        },
        url: String,
        filename: String,
        title: String,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
