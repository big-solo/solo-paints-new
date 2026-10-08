const mongoose = require('mongoose');
const QuoteSchema = new mongoose.Schema({
  name:String, phone:String, location:String,
  service:String, size:String, color:String,
  paintType:String, buckets:String,
  paintCost:Number, workCost:Number, total:String,
  details:String, status:{type:String, default:'New'},
  createdAt:{type:Date, default:Date.now}
});
module.exports = mongoose.model('Quote', QuoteSchema);