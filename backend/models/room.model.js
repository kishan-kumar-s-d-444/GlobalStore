import mongoose from "mongoose";

const roomSchema=new mongoose.Schema({
    roomName:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    profilePhoto:{
        type:String,
        required:true
    },
    externalLinks:[{
        type:String,
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
},{
    timestamps:true,
    
});
export const Room = mongoose.model('Room', roomSchema);
