import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema({

    referralCode: {
        type: String,
        required: false,
    },

    memberID: {
        type: String,
        required: true,
    },
    memberType: {
        type: String,
        required: true,
    },

    addressNo: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    province: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    barangay: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    memberStatus: {
        type: String,
        required: true,
    },
    paymentType: {
        type: String,
        required: true,
    },
    referredBy: {
        type: String,
        required: false,
    },

    memberDate: {
        type: String,
        required: true,
    },

})

export const Member = mongoose.model("Member", MemberSchema)