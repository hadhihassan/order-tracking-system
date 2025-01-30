import Order from "../models/order.model.js";

export function handleSocketEvents(io, socket, customersSocketMap, driverSocketMap, userId) {
    // Handle order placement
    socket.on("placeOrder", async (orderData) => {
        try {
            console.log('orderDetails', parseInt("" + orderData.total))
            const order = new Order({
                userId: socket.user.userId,
                total: parseInt(orderData.total),
                status: orderData.status,
                items: orderData.items
            });
            await order.save();
            console.log("Order placed:", order);

            // Notify all drivers about the new order
            io.to("drivers").emit("newOrder", order);
        } catch (error) {
            console.error("Error placing order:", error);
            socket.emit("orderError", { message: "Failed to place order" });
        }
    });

    //Handle order acceptance
    socket.on("orderAccept", async (orderData) => {
        try {
            const order = await Order.findById(orderData.orderId);

            if (order && order.status === "accept") {
                order.driverId = socket.user.userId;
                order.status = "accepted";
                await order.save();

                io.to(customersSocketMap[order.userId]).emit("orderAccepted", order);
                io.to(driverSocketMap[order.driverId]).emit("orderAccepted", order);

            }
        } catch (error) {
            console.error("Error accepting order:", error);
            socket.emit("orderError", { message: "Failed to accept order" });
        }
    })

    // Update Order status 
    socket.io("udpateStatus", async () => {
        tr
    })

    // Handle disconnection
    socket.on("disconnect", () => {
        socket.on("disconnect", () => {
            console.log("A user disconnected", socket.id);
            delete customersSocketMap[userId];
        });
    });
}
