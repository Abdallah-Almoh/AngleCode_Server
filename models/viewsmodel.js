const mongoose = require('mongoose');
const viewsSchema = mongoose.Schema({
    viewsCount:Number,
});
const Views =  mongoose.model('Views', viewsSchema);
module.exports = Views;