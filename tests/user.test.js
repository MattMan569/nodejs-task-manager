const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const {userOneId, userOne, setupDatabase, disconnectDatabase} = require('./fixtures/db');

beforeEach(setupDatabase);

// Prevent Jest's open handles error
afterAll(disconnectDatabase);

test('Signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Sign Up Test',
        email: 'signup@email.com',
        password: 'signuptest',
    }).expect(201);

    // Assert that the db was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Sign Up Test',
            email: 'signup@email.com',
        },
        token: user.tokens[0].token,
    });
    expect(user.password).not.toBe('signuptest');
});

test('Login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password,
    }).expect(200);

    // Assert that the token was saved
    const user = await User.findById(response.body.user._id);
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Fail to login existing user with bad credentials', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'incorrectpass',
    }).expect(400);
});

test('Get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Do not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer _`)
        .send()
        .expect(401);
});

test('Delete user\'s account', async () => {
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    // Assert that the user was deleted
    const user = await User.findById(response.body);
    expect(user).toBeNull();
});

test('Do not delete unauthenticated user\'s account', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer _`)
        .send()
        .expect(401);
});

test('Upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

    // Assert that the avatar field is a Buffer
    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Update valid user field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({name: 'User One Updated'})
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.name).toBe('User One Updated');
});

test('Do not update invalid user field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({location: 'Regina'})
        .expect(400);
});
