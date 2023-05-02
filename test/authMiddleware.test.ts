import jwt from 'jsonwebtoken';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { protect } from '../middleware/authMiddleware';
import dotenv from "dotenv"

dotenv.config()

describe('protect middleware', () => {
    const collections = {
        users: {
            findById: vi.fn(),
        },
    };
    const req: any = {
        headers: {},
        user: null,
    };
    const res: any = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
    };
    const next = vi.fn();
    const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET as string);

    test('should call next if token is valid', async () => {
        req.headers.authorization = `Bearer ${token}`;
        const user = { id: '123', name: 'John Doe', email: 'john@example.com' };
        vi.spyOn(collections.users, 'findById').mockResolvedValue(user);
        await protect(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test('should return 401 if token is invalid', async () => {
        req.headers.authorization = `Bearer invalidToken`;
        await protect(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).toHaveBeenCalledWith(new Error('Not authorized'));
    });

    test('should return 401 if no token is provided', async () => {
        await protect(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).toHaveBeenCalledWith(new Error('Not authorized'));
    });
});