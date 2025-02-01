import { bcryptPassword, generateBcryptSalt, compareHashedPassword } from "../../lib/bcrypt.js";
import bcrypt from "bcryptjs";

jest.mock("bcryptjs", () => ({
    hash: jest.fn(),
    genSalt: jest.fn(),
    compare: jest.fn(),
}));


describe("Bcrypt Utility Functions", () => {
    const mockPassword = "securePassword";
    const mockSalt = "mockSalt";
    const mockHash = "mockHashedPassword";
    const rounds = 10

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("bcryptPassword", () => {
        it("should hash the password with given salt", async () => {
            bcrypt.hash.mockResolvedValue(mockHash);

            const result = await bcryptPassword(mockPassword, mockSalt);
            expect(result).toBe(mockHash);
            expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, mockSalt);
        });

        it("should throw an error if bcrypt.hash fails", async () => {
            bcrypt.hash.mockRejectedValue(new Error("Hashing failed"));

            await expect(bcryptPassword(mockPassword, mockSalt)).rejects.toThrow("Hashing failed");
        });
    });

    describe("generateBcryptSalt", () => {
        it("shoule generate bcrypt salt", async () => {
            bcrypt.genSalt.mockResolvedValue(mockSalt);

            const result = await generateBcryptSalt()
            expect(result).toBe(mockSalt);
            expect(bcrypt.genSalt).toHaveBeenCalledWith(10)
        });

        it('should throw an error if bcrypt.genSalt fails', async () => {
            bcrypt.genSalt.mockRejectedValue(new Error("Salt generate failed"));

            await expect(generateBcryptSalt()).rejects.toThrow("Salt generate failed")
        })
    })


    describe("compareHashedPassword", () => {
        it("should return true when passwords match", async () => {
            bcrypt.compare.mockResolvedValue(true);

            const result = await compareHashedPassword(mockPassword, mockHash);
            expect(result).toBe(true);
            expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHash)
        })

        it("should return false when passwords do not match", async () => {
            bcrypt.compare.mockResolvedValue(false);

            const result = await compareHashedPassword(mockPassword, mockHash);
            expect(result).toBe(false)
        })

        it("should throw an error if bcrypt.compare fails", async () => {
            bcrypt.compare.mockRejectedValue(new Error("Comparison failed"));

            await expect(compareHashedPassword(mockPassword, mockHash)).rejects.toThrow("Comparison failed");
        });
    })
})