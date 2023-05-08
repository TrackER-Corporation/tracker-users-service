import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { registerUser, loginUser, getUserById, updateUserById, deleteUserById, updateUserPasswordById, getAll } from "../db/controller/controller";
import { collections, connectToDatabase } from "../db/services/database.service";
import { ObjectId } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

interface Response {
    status: number | any
    json: any
}

describe('Activity controller', async () => {
    beforeAll(async () => {
        await connectToDatabase()
        vi.clearAllMocks();
    });

    afterAll(async () => {
        it('should return ok registering a new user', async () => {
            const req = {
                body: {
                    name: "test",
                    surname: "test",
                    email: "test@test",
                    password: "qwerty",
                    type: "Building"
                }
            };
            const res = mockResponse();
            await registerUser(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });


        it('should return ok logging in', async () => {
            const req = {
                body: {
                    email: "test@test",
                    password: "qwerty"
                }
            };
            const res = mockResponse();
            await loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return ok deleting user', async () => {
            const req = {
                params: {
                    id: testId
                }
            };
            const res = mockResponse();
            await deleteUserById(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            await collections.users?.deleteOne({ _id: new ObjectId(testId) })
        });
    })

    let testId: string

    const mockResponse = () => {
        const res: Response = {
            json: {},
            status: {}
        };
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        return res;
    };

    it('should return error registering user', async () => {
        const req = {
            body: {
                name: "test",
                surname: "test",
            }
        };
        const res = mockResponse();
        expect(async () => await registerUser(req, res, {})).rejects.toThrow(/Invalid user data/);
    });

    it('should return error user already registered', async () => {
        const req = {
            body: {
                name: "test2",
                surname: "test2",
                email: "test@test",
                password: "qwerty2"
            }
        };
        const res = mockResponse();
        expect(async () => await registerUser(req, res, {})).rejects.toThrow(/Invalid user data/);

    });

    it('should return error getting user with no id', async () => {
        const req = {
            params: {
                id: ""
            }
        };
        const res = mockResponse();
        expect(async () => await getUserById(req, res, {})).rejects.toThrow(/Invalid user data/);
    });

    it('should return error getting user with wrong id', async () => {
        const req = {
            params: {
                id: "999999999999"
            }
        };
        const res = mockResponse();
        expect(async () => await getUserById(req, res, {})).rejects.toThrow(/Invalid user data/);
    });

    it('should return ok getting all users', async () => {
        const req = {};
        const res = mockResponse();
        await getAll(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        if (res.json.calls[0][0].at(-1).email === "test@test") {
            testId = res.json.calls[0][0].at(-1)._id.toString()
        }
    });

    // it('should return ok getting user with id', async () => {
    //     const req = {
    //         params: {
    //             id: "62d969dc498c4385d676ce41"
    //         }
    //     };
    //     const res = mockResponse();
    //     await getUserById(req, res);
    //     expect(res.status).toHaveBeenCalledWith(200);
    // });

    it('should return error updating user with no id', async () => {
        const req = {
            params: {
                id: ""
            }
        };
        const res = mockResponse();
        expect(async () => await updateUserById(req, res, {})).rejects.toThrow(/Invalid user data/);

    });

    it('should return error updating user with wrong id', async () => {
        const req = {
            params: {
                id: "999999999999"
            }
        };
        const res = mockResponse();
        expect(async () => await updateUserById(req, res, {})).rejects.toThrow(/Invalid user data/);
    });

    it('should return ok updating user', async () => {
        const req = {
            params: {
                id: testId
            },
            body: {
                name: "test2"
            }
        };
        const res = mockResponse();
        await updateUserById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return error updating password with no id', async () => {
        const req = {
            params: {
                id: ""
            }
        };
        const res = mockResponse();
        expect(async () => await updateUserPasswordById(req, res, {})).rejects.toThrow(/Invalid user data/);
    });

    it('should return error loggin in with wrong password', async () => {
        const req = {
            body: {
                email: "test@test",
                password: "12345"
            }
        };
        const res = mockResponse();
        expect(async () => await loginUser(req, res, {})).rejects.toThrow(/Invalid user data/);
    });

    it('should return error updating password with wrong id', async () => {
        const req = {
            params: {
                id: "999999999999"
            },
            body: {
                password: "palla"
            }
        };
        const res = mockResponse();
        expect(async () => await updateUserPasswordById(req, res, {})).rejects.toThrow(/Invalid user data/);
    });

    it('should return ok updating password', async () => {
        const req = {
            params: {
                id: testId
            },
            body: {
                password: "palla"
            }
        };
        const res = mockResponse();
        await updateUserPasswordById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });



    it('should return error deleting user with no id', async () => {
        const req = {
            params: {
                id: ""
            }
        };
        const res = mockResponse();
        expect(async () => await deleteUserById(req, res, {})).rejects.toThrow(/Invalid user data/);
    });

    it('should return error deleting user with wrong id', async () => {
        const req = {
            params: {
                id: "999999999999"
            }
        };
        const res = mockResponse();
        expect(async () => await deleteUserById(req, res, {})).rejects.toThrow(/Invalid user data/);
    });

});