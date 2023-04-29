import jwt from 'jsonwebtoken';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { protect } from '../middleware/authMiddleware';
import dotenv from "dotenv"


describe('protect middleware', () => {
    let req: any, res: any, next: any, token: any;
    let collections: any;

    beforeAll(() => {
        dotenv.config()

        collections = {
            users: {
                findById: vi.fn(),
            },
        };
        req = {
            headers: {},
            user: null,
        };
        res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        };
        next = vi.fn();
        token = jwt.sign({ id: '123' }, process.env.JWT_SECRET as string);
    });

    test('should call next if token is valid', async () => {
        req.headers.authorization = `Bearer ${token}`;
        const user = { id: '123', name: 'John Doe', email: 'john@example.com' };
        vi.spyOn(collections.users, 'findById').mockResolvedValue(user);
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        await protect(req, res, next);

        // expect(req.user).toEqual(user);
        // expect(collections.users?.findById).toHaveBeenCalledWith(decoded.id);
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