var mongoose = require("mongoose");
const { Schema } = mongoose;

const siteSchema = new Schema({
  name: { type: String },
  description: { type: String },
  keywords: { type: String },
});

const Site = mongoose.model("Site", siteSchema);

module.exports = { Site, siteSchema };
