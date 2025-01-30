import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    rejectedBy: [{
        driverId: String,
        reason: String,
    }],
    items: {
        type: [String],
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['placed', 'accepted', 'reject', 'preparing', 'outForDelivery', 'delivered'],
        default: 'placed',
    },
    createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);
export default Order