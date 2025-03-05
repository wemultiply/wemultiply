import mongoose from "mongoose";

const goldenSeatsSchema = new mongoose.Schema({
    captain:{
        type:String,
        required:true
    },
    mayor:{
        type:String,
        required:true
    },
    governor:{
        type:String,
        required:true
    },
    senator:{
        type:String,
        required:true
    },
    vicePresident:{
        type:String,
        required:true
    },
    President:{
        type:String,
        required:true
    },
    commission:{
        type:Number,
        required: true
    }
})

export const goldenseats = mongoose.model('Goldenseats', goldenSeatsSchema);