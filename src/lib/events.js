import Order from "../models/order.model.js";
import { ORDER_STATUSES } from "./constant.js";
import { getDriverSocketId, getCustomerSocketId } from "./socket.js";

export function handleSocketEvents(io, socket) {
    // Handle order placement
    socket.on("placeOrder", async (orderData) => {
        try {
            const order = new Order({
                userId: socket.user.userId,
                total: parseInt(orderData.total),
                status: orderData.status,
                items: orderData.items
            });
            await order.save();

            io.to("drivers").emit("newOrder", order);
        } catch (error) {
            console.error("Error placing order:", error);
            io.to(getCustomerSocketId(socket.user.userId)).emit("orderError", { message: "Failed to place order" });
        }
    });

    //Handle order acceptance
    socket.on("orderAccept", async ({ orderId }) => {
        try {
            const order = await Order.findById(orderId);

            if (!order) {
                return io.to(getCustomerSocketId(socket.user.userId)).emit("orderError", { message: "Order not " });
            }

            if (order && order.status === "placed") {
                order.driverId = socket.user.userId;
                order.status = "accepted";
                await order.save();

                io.to(getCustomerSocketId(order.userId)).emit("orderAccepted", order);
                io.to(getCustomerSocketId(order.driverId)).emit("orderAccepted", order);

                socket.broadcast.to('drivers').emit('removeOrder', { orderId: order._id });
            }
        } catch (error) {
            console.error("Error accepting order:", error);
            io.to(getCustomerSocketId(socket.user.userId)).emit("orderError", { message: "Failed to accept order" });
        }
    })

    //Handle order update
    socket.on("udpateOrderStatus", async ({ orderId, status }) => {
        try {
            if (!Object.values(ORDER_STATUSES).includes(status) && status !== ORDER_STATUSES.DELIVERED) {
                return io.to(getCustomerSocketId(socket.user.userId)).emit("orderError", { message: "Invalid order status" });
            }

            const order = await Order.findById(orderId);
            if (!order) {
                return io.to(getCustomerSocketId(socket.user.userId)).emit("orderError", { message: "Order not found" });
            }

            if (order.driverId.toString() !== socket.user.userId) {
                return io.to(getCustomerSocketId(socket.user.userId)).emit("orderError", { message: "Unauthorized action" });
            }

            if (ORDER_STATUSES.REJECT === status) {
                order.rejectedBy.push(socket.user.userId);
            }
            order.status = status;
            await order.save();

            const customerSocketId = getCustomerSocketId(order.userId);
            const driverSocketId = getDriverSocketId(order.driverId);

            if (customerSocketId) {
                io.to(customerSocketId).emit("orderStatusUpdated", { orderId, status });
            }

            if (driverSocketId) {
                io.to(driverSocketId).emit("orderStatusUpdated", { orderId, status });
            }

        } catch (error) {
            console.error("Error updating order status:", error);
            return io.to(getCustomerSocketId(socket.user.userId)).emit("orderError", { message: "Failed to update order status" })
        }
    })

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        const userId = socket.handshake.query.userId;

        if (socket.user.role === "deliveryMan") {
            socket.join("drivers");
            delete getDriverSocketId(userId);
        } else {
            socket.join("customers");
            delete getCustomerSocketId(userId);
        }
    });
}