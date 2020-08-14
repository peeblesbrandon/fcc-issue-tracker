const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  project: { type: String, required: true },
  issue_title: { type: String, require: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, required: false, default: '' },
  status_text: { type: String, required: false, default: '' },
  open: { type: Boolean, required: false, default: true }
}, { timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' } });

module.exports = mongoose.model('Issue', issueSchema);