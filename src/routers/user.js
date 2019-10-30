const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();

        const token = await user.generateAuthToken();

        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send();
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
    const user = req.user;
    const body = req.body;
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const updates = Object.keys(body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid update field'});
    }

    try {
        updates.forEach((update) => user[update] = body[update]);
        await user.save();

        res.send(user);
    } catch (e) {
        if (e._message == 'Validation failed') {
            res.status(400).send(e);
        } else {
            res.status(500).send(e);
        }
    }
});

router.delete('/users/me', auth, async (req, res) => {
    const user = req.user;

    try {
        await user.remove();
        res.send(user);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
