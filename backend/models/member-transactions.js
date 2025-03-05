import mongoose from "mongoose";

const MemberTransactionSchema = new mongoose.Schema({
    memberId: {
        type: String,
        required: false
    },
    transactionId: {
        type: String,
        required: false
    },
    productName: {
        type: String,
        required: false
    },
    productImage: {
        type: String,
        required: false
    },
    quantity: {
        type: Number,
        required: false
    },
    price: {
        type: Number,
        required: false
    },
    total: {
        type: Number,
        required: false
    },
    paymentMethod: {
        type: String,
        required: false
    },
    transactionDate: {
        type: String,
        required: false
    },
})

export const MemberTransaction = mongoose.model('MemberTransaction', MemberTransactionSchema);