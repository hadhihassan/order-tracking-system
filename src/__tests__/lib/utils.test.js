import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from '../../lib/utils.js'

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn()
}))

describe('Utilis Functions', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockRes = {
        cookie: jest.fn(),
    };
    const userId = "user-123";
    const role = "customer";
    const token = "mocked_token";

    describe('generateToken', () => {
        it('should return jwt token and set it as a cookie', () => {
            jwt.sign.mockReturnValue(token);

            const result = generateToken(userId, mockRes, role);

            expect(jwt.sign).toHaveBeenCalledWith(
                { userId, role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );
            expect(result).toBe(token);

            expect(mockRes.cookie).toHaveBeenCalledWith("jwt", token, expect.objectContaining({
                maxAge: 7 * 24 * 60 * 60 * 1000, 
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV !== "development",
            }));
        });
    })
    describe("verifyToken", () => {
        it("should verify a JWT token", () => {
            const decoded = { userId, role };
            jwt.verify.mockReturnValue(decoded);

            const result = verifyToken(token);

            expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);

            expect(result).toEqual(decoded);
        });

        it("should throw an error if the token is invalid", () => {
            const error = new Error("Invalid token");
            jwt.verify.mockImplementationOnce(() => { throw error; });

            expect(() => verifyToken(token)).toThrowError(error);
        });
    });
})