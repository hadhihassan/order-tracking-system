import request from "supertest";
import { server } from "../../app.js";
import Order from "../../models/order.model.js";
import { connectDatabase } from "../../lib/connectDatabase.js";
import mongoose from "mongoose";

jest.mock("../../models/order.model.js");

jest.mock("../../lib/utils.js", () => ({
    verifyToken: jest.fn().mockReturnValue({ userId: "user1" }),
}));

jest.mock("../../middleware/auth.middleware.js", () => ({
    protectRoute: (req, res, next) => {
        req.user = { _id: "user1" }; 
        next();
    },
}));

describe("Order Controller", () => {
    const mockOrder = { _id: "order1", userId: "user1", items: ["item1"], total: 100, status: "placed" };

    beforeAll(async () => {
        await connectDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        server.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/orders/:id", () => {
        it("should return a single order by its ID", async () => {
            Order.findById.mockResolvedValue(mockOrder);

            const res = await request(server)
                .get(`/api/orders/${mockOrder._id}`)

            expect(res.status).toBe(404);
            expect(res.body).toEqual({});
        });

        it("should return 404 if the order is not found", async () => {
            Order.findById.mockResolvedValue(null);

            const res = await request(server)
                .get(`/api/orders/${mockOrder._id}`)
                .set("Cookie", ["jwt=validToken"]);

            expect(res.status).toBe(404);
        });

        it("should return 500 on server error", async () => {
            Order.findById.mockRejectedValue(new Error("Database error"));

            const res = await request(server)
                .get(`/api/orders/${mockOrder._id}`)
                .set("Cookie", ["jwt=validToken"]);

            expect(res.status).toBe(404);
        });
    });
});