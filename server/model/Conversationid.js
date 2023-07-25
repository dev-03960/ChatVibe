const mongoose = require('mongoose');

const ConversationSchema = mongoose.Schema({
    Members: {
        type: Array,
        required: true,
    },
  
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;