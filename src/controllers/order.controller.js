import Order from "../models/order.model.js";

// Get all orders
export const getAllOrder = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id });
        if (!orders) {
            return res.status(404).json({ message: "No orders found" });
        }
        res.status(200).json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get a single order by its _id
export const getOrder = async (req, res) => {
    const { id } = req.params; 

    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
    
};
