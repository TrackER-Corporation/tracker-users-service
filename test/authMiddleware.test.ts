import { describe, expect, it, vi } from 'vitest';
import { protect } from '../middleware/authMiddleware';
import dotenv from "dotenv"
import jwt from "jsonwebtoken";

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

    it('should connect', async () => {
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
    it("should call next() if valid token is provided", async () => {
        const req = {
            headers: {
                authorization: "Bearer <token>",
            },
        };
        const res = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        };
        const next = vi.fn();
        const decoded = { id: "user-id" };
        const findByIdMock = vi.fn().mockResolvedValue({
            _id: decoded.id,
            name: "John Doe",
        });
        const collections = {
            users: {
                findById: findByIdMock,
            },
        };

        const verifyMock = vi
            .spyOn(jwt, "verify")
            .mockReturnValue(decoded as any);

        await protect(req, res, next);
        expect(verifyMock).toHaveBeenCalledWith("<token>", process.env.JWT_SECRET);
    });
});