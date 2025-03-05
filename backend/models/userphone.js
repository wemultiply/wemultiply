import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Basic Information
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    // Phone Authentication Fields
    phoneNumber: {
        type: String,
        sparse: true,  // Allows null/undefined while still maintaining uniqueness
    },
    password: {
        type: String,
    },
    verificationCode: String,
    verificationCodeExpiry: Date,
})
export const UserPhone = mongoose.model("UserPhone", userSchema);