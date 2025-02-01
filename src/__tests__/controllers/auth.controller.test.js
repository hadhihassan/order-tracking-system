import request from "supertest";
import { server } from "../../app.js";
import User from "../../models/user.model.js";
import { compareHashedPassword } from "../../lib/bcrypt.js";
import { connectDatabase } from "../../lib/connectDatabase.js";
import mongoose from "mongoose";
import { logout } from "../../controllers/auth.controller.js";

jest.mock("../../lib/bcrypt.js", () => ({
    bcryptPassword: jest.fn().mockResolvedValue("hashedpassword"),
    generateBcryptSalt: jest.fn().mockResolvedValue("randomsalt"),
    compareHashedPassword: jest.fn(),
}));
jest.mock("../../lib/utils.js");

describe("Auth Controller", () => {

    const mockUser = {
        _id: "asdsad",
        fullName: "John Doe",
        email: "john@example.com",
        password: "hashedpassword",
        role: "customer",
    }

    beforeEach(async () => {
        await User.deleteMany({});
        jest.clearAllMocks();
    });

    beforeAll(async () => {
        await connectDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        server.close();
    });

    describe("signup POST /api/auth/signup", () => {
        it("should create a new user with valid inputs", async () => {

            const res = await request(server)
                .post('/api/auth/signup')
                .send({
                    fullName: "John Doe",
                    email: "john@example.com",
                    password: "hashedpassword",
                    role: "customer",
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("email", mockUser.email);
            expect(res.body).toHaveProperty("fullName", mockUser.fullName);
        });

        it("should return 400 if required fields are missing", async () => {
            const res = await request(server)
                .post("/api/auth/signup")
                .send({
                    fullName: "John Doe",
                    password: "hashedpassword",
                    role: "customer",
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("All fields are required");
        });

        it("should return 400 if password is too short", async () => {
            const res = await request(server)
                .post("/api/auth/signup")
                .send({
                    fullName: "John Doe",
                    email: "john@example.com",
                    password: "12",
                    role: "customer",
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Password must be at least 6 characters");
        });

        it("should return 400 if email already exists", async () => {
            await User.create({
                fullName: "existing",
                email: "exisintng@example.com",
                password: "hashedpassword",
                role: "customer",
            });

            const res = await request(server)
                .post('/api/auth/signup')
                .send({
                    fullName: "existing",
                    email: "exisintng@example.com",
                    password: "hashedpassword",
                    role: "customer",
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Email already exists");
        });

        it("should return 500 on internal server error", async () => {

            jest.spyOn(User.prototype, "save").mockImplementationOnce(() => {
                throw new Error("Database error");
            });

            const res = await request(server)
                .post("/api/auth/signup")
                .send({
                    fullName: "John Does",
                    email: "john@sexample.com",
                    password: "hasshedpassword",
                });

            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Internal Server Error");
        });
    });

    describe("Login POST /api/auth/login", () => {
        it("should login with valid credentials", async () => {
            jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
            compareHashedPassword.mockResolvedValue(true);

            const res = await request(server)
                .post("/api/auth/login")
                .send({
                    email: "john@example.com",
                    password: "hashedpassword",
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("email", mockUser.email);
            expect(res.body).toHaveProperty("fullName", mockUser.fullName);
            expect(res.body).toHaveProperty("role", mockUser.role);
        });

        it("should return 400 if email is not found", async () => {
            jest.spyOn(User, "findOne").mockResolvedValue(null);
            const res = await request(server).post("/api/auth/login").send({
                email: "john@exampaasale.com",
                password: "passworasad123",
            });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Invalid Credentials");
        });

        it("should return 400 if password is incorrect", async () => {
            jest.fn(User.prototype, "findOne").mockResolvedValue(mockUser)
            compareHashedPassword.mockResolvedValue(false);

            const res = await request(server).post("/api/auth/login").send({
                email: "john@example.com",
                password: "wrongpassword",
            });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Invalid Credentials");
        });

        it("should return 500 on internal server error", async () => {
            jest.spyOn(User, "findOne").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
            const res = await request(server).post("/api/auth/login").send({
                email: "john@example.com",
                password: "password123",
            });

            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Internal Server Error");
        });
    });

    describe("Logout GET /api/auth/logout", () => {
        it("should log out the user successfully", async () => {
            const res = {
                cookie: jest.fn(),
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const req = {}; 

            await logout(req, res);

            expect(res.cookie).toHaveBeenCalledWith("jwt", "", { maxAge: 0 });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("should return 500 on internal server error", async () => {
            const res = {
                cookie: jest.fn().mockImplementation(() => {
                    throw new Error("Cookie Error");
                }),
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const req = {};

            await logout(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Internal Server Error"
            });
        });
    })
});