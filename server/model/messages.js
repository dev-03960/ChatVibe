const mongoose = require('mongoose');

const MessagesSchema = mongoose.Schema({
   conversationId:{
    type:String,
   },
   senderId:{
    type:String,
   },
   message:{
    type:String,
   }
});

const Messages = mongoose.model('Messages', MessagesSchema);

module.exports = Messages;