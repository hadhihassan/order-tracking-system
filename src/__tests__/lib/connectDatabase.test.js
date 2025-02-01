import mongoose from 'mongoose';
import { connectDatabase } from '../../lib/connectDatabase';

jest.mock('mongoose', () => ({
    connect: jest.fn(),
}));

describe('connectDatabase', () => {
    it('should connect to MongoDB successfully', async () => {
        mongoose.connect.mockResolvedValue();

        await connectDatabase();
        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    });

    it('should handle connection error', async () => {
        const errorMessage = 'Connection failed';
        mongoose.connect.mockRejectedValue(new Error(errorMessage));
        jest.spyOn(process, 'exit').mockImplementation(() => { });

        await connectDatabase();
        expect(process.exit).toHaveBeenCalledWith(1);
    });
});
