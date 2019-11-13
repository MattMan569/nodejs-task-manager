const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {userOneId, userOne, setupDatabase, disconnectDatabase} = require('./fixtures/db');

beforeEach(setupDatabase);

// Prevent Jest's open handles error
afterAll(disconnectDatabase);

test('Create task for user', async () => {

});
