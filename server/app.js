const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server,{
    cors : {
       origin: '*', // Replace this with the client's domain (e.g., http://localhost:3000 for development)
      }
})

const connectToDatabase = require('./Database/collection');
const User = require('./model/User');
const Conversation = require('./model/Conversationid');
const Messages = require('./model/messages');
const { Socket } = require('socket.io');


app.use(express.json());
app.use(express.urlencoded({extended : false}));
const corsOptions = {
    origin: 'https://chatvibedev.netlify.app' , // Replace this with the client's domain (e.g., http://localhost:3000 for development)
  };

app.use(cors(corsOptions));

const port = process.env.PORT ||  8000;

let users = [];
io.on('connection', socket => {
    console.log('user Connected on', socket.id);

    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const newUser = { userId, socketId: socket.id };
            users.push(newUser);
            io.emit('getUser', users);
        }
    });
    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await User.findById(senderId);
        console.log('sender :>> ', sender, receiver);
        
        if (receiver) {
            io.to(receiver.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: { id: user._id, fullName: user.fullName, email: user.email }
            });
        }
    
        io.to(sender.socketId).emit('getMessage', {
            senderId,
            message,
            conversationId,
            receiverId,
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });
    });
    


    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
    // If you want to send the user to the newly connected socket, you can emit it here
    // socket.emit('getUser', users);
});


app.get("/" , (req,res) => {
    res.send("welcome");
});

app.post('/api/register', async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            res.status(400).send('Please fill all required fields');
        } else {
            const isAlreadyExist = await User.findOne({ email });
            if (isAlreadyExist) {
                res.status(400).send('User already exists');
            } else {
                const newUser = new User({ fullName, email });
                bcryptjs.hash(password, 10, (err, hashedPassword) => {
                    newUser.set('password', hashedPassword);
                    newUser.save();
                    next();
                })
                return res.status(200).send('User registered successfully');
            }
        }

    } catch (error) {
        console.log(error, 'Error')
    }
})
app.post('/api/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).send('Please fill all required fields');
        } else {
            const user = await User.findOne({ email });
            if (!user) {
                res.status(400).send('User Passowrd and Email is incorrect');
            } else {
                const ValidateUser = await bcryptjs.compare(password,user.password);
                  if(!ValidateUser)
                  {
                    res.status(400).send('User Passowrd and Email is incorrect');
                  }
                  else{
                      const payload = {
                        userid : user.id,
                        emailid : user.email,
                      }
                      const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'THIS_IS_A_JWT_SECRET_KEY';
                      jwt.sign(payload,JWT_SECRET_KEY,{ expiresIn: 84600 },async (err,token)=>{
                        await user.updateOne({ _id: user._id }, {
                            $set: { token }
                        })
                        user.save()

                        return res.status(200).json({ user: { id: user._id, email: user.email, fullName: user.fullName }, token: token })
                      })
                  }
            }
        }

    } catch (error) {
        console.log(error, 'Error')
    }
})

app.post('/api/conversation',async (req,res)=>{

    try {
        const {senderid,reciverid} = req.body;
        const newConversation = new Conversation({Members : [senderid, reciverid]});
        await newConversation.save();
        return res.status(200).send("Conversation started successfully");

    } catch (error) {
        console.log('Error',error);
    }


})

app.get('/api/conversation/:userId',async (req,res)=>{

    try {
        const userId = req.params.userId;
        const conversations = await Conversation.find({ Members: { $in: [userId] } });
        const conversationUserData = await Promise.all(conversations.map(async (conversation) => {
            const receiverId = conversation.Members.find((member) => member !== userId);
            const user = await User.findById(receiverId);
            return {
                user: {
                    receiverId: user._id,
                    email: user.email,
                    fullName: user.fullName
                },
                conversationId: conversation._id
            };
        }));
        return res.status(200).json(conversationUserData);

    } catch (error) {
  console.log('Error',error);
    }


 });

 app.post('/api/messages',async(req,res)=>{

    try {
        const {conversationId,senderId,message,receiverId = ''} = req.body;
        if (!conversationId || !senderId || !message) {
           return res.status(400).send('Please give all required fields');}
           if (conversationId === 'new' && receiverId) {
               console.log(receiverId);
            const newCoversation = new Conversation({ Members: [senderId, receiverId] });
               console.log(newCoversation);
            await newCoversation.save();
            const newMessage = new Messages({ conversationId: newCoversation._id, senderId, message });
            await newMessage.save();
            return res.status(200).send('Message sent successfully');
        }
        else if (!conversationId && !receiverId) {
            return res.status(400).send('Please give all required fields')
        }

        const newMessage = new Messages({conversationId,senderId,message});
       await newMessage.save();
        res.status(200).send('Message sent Successfully');
    } catch (error) {
        
    }
 });


app.get('/api/messages/:conversationId',async (req,res)=>{
    try {

    const checkMessages = async (conversationId) => {
        console.log(conversationId, 'conversationId')
        const messages = await Messages.find({ conversationId });
        const messageUserData = Promise.all(messages.map(async (message) => {
            const user = await User.findById(message.senderId);
            return { user: { id: user._id, email: user.email, fullName: user.fullName }, message: message.message }
        }));
        res.status(200).json(await messageUserData);
    }
    const conversationId = req.params.conversationId;
    if (conversationId === 'new') {
        const checkConversation = await Conversation.find({ Members: { $all: [req.query.senderId, req.query.receiverId] } });
        if (checkConversation.length > 0) {
            checkMessages(checkConversation[0]._id);
        } else {
            return res.status(200).json([])
        }
    } else {
        checkMessages(conversationId);
    }

    } catch (error) {
  console.log('Error',error);
    }

})


 app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const users = await User.find({ _id: { $ne: userId } });
        const usersData = Promise.all(users.map(async (user) => {
            return { user: { email: user.email, fullName: user.fullName, receiverId: user._id } }
        }))
        res.status(200).json(await usersData);
    } catch (error) {
        console.log('Error', error)
    }
});

connectToDatabase()
  .then(() => {
    const port = process.env.PORT || 8000;
    server.listen(port, () => {
      console.log("APP listen on " + port);
    });
  })
  .catch((error) => {
    console.error('Error starting the server:', error);
  });
