const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const router = new express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.status(201).send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});

        if (!users) {
            return res.status(404).send();
        }

        res.send(users);
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send({error: 'Invalid id'});
    }

    try {
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/users/:id', async (req, res) => {
    const _id = req.params.id;
    const body = req.body;
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const updates = Object.keys(body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send({error: 'Invalid id'});
    }

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid update field'});
    }

    try {
        const user = await User.findByIdAndUpdate(_id, body, {new: true, runValidators: true});

        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (e) {
        if (e._message == 'Validation failed') {
            res.status(400).send(e);
        } else {
            res.status(500).send(e);
        }
    }
});

router.delete('/users/:id', async (req, res) => {
    const _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send({error: 'Invalid id'});
    }

    try {
        const user = await User.findByIdAndDelete(_id);

        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
