import { describe, expect, it, vi } from 'vitest';
import { protect } from '../middleware/authMiddleware';
import dotenv from "dotenv"

dotenv.config()

describe('protect middleware', () => {
    it('should return 401 if token is invalid', async () => {
        const req: any = {
            headers: {},
            user: null,
        };
        const res: any = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        };
        const next = vi.fn();
        req.headers.authorization = `Bearer invalidToken`;
        await protect(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).toHaveBeenCalledWith(new Error('Not authorized'));
    });

    it('should return 401 if no token is provided', async () => {
        const req: any = {
            headers: {},
            user: null,
        };
        const res: any = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        };
        const next = vi.fn();
        await protect(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).toHaveBeenCalledWith(new Error('Not authorized, no token'));
    });
});