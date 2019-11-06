const request = require('supertest');
const app = require('../src/app');
const mongoose = require('../src/db/mongoose');
const User = require('../src/models/user');

const userOne = {
    name: 'User One',
    email: 'userone@email.com',
    password: 'useronepass',
};

beforeEach(async () => {
    await User.deleteMany();
    await new User(userOne).save();
});

// Prevent Jest's open handles error
afterAll(async () => await mongoose.disconnect());

test('Signup a new user', async () => {
    await request(app).post('/users').send({
        name: 'Sign Up Test',
        email: 'signup@email.com',
        password: 'signuptest',
    }).expect(201);
});

test('Login existing user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password,
    }).expect(200);
});

test('Login existing user with bad credentials', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'incorrectpass',
    }).expect(400);
});
