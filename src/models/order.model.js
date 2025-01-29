import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
        type: String,
        enum: ['placed', 'accepted', 'preparing', 'out for delivery', 'delivered'],
        default: 'placed',
    },
    createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);
export default Order
