import { describe, expect, it } from "vitest";
import * as mongoDB from 'mongodb';
import { collections, connectToDatabase } from "../db/services/database.service";


describe('connectToDatabase', () => {
    it('should connect to the database and set up the activity collection', async () => {

        // Connect to the database
        await connectToDatabase();

        // Check that the activity collection has been set up
        expect(collections.users).toBeInstanceOf(mongoDB.Collection);

        // Check that the connection was successful by inserting a new activity
        const users = {
            _id: new mongoDB.ObjectId("111111111111"),
            name: "test",
            surname: "test",
            email: "test@test",
            password: "$2a$10$rUmw/c7v3NGhGqawkNLC.uq94V.gUqnkQr3fQzV0MVWDetrUJwLBS",
            type: "Building",
            date: Date.now(),
            __v: 0
        };

        const result = await collections.users?.insertOne(users);
        expect(result?.acknowledged).toBe(true);

        // Clean up by deleting the test activity
        await collections.users?.deleteOne({ _id: result?.insertedId });
    });
});