const express = require('express');
const mongoose = require('mongoose');
require('./db/mongoose');
const User = require('./models/user');
const Task = require('./models/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.status(201).send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get('/users', async (req, res) => {
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

app.get('/users/:id', async (req, res) => {
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

app.patch('/users/:id', async (req, res) => {
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

        res.status(200).send(user);
    } catch (e) {
        if (e._message == 'Validation failed') {
            res.status(400).send(e);
        } else {
            res.status(500).send(e);
        }
    }
});

app.post('/tasks', async (req, res) => {
    const task = new Task(req.body);

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get('/tasks', async (req, res) => {
    const tasks = await Task.find({});

    try {
        if (!tasks) {
            return res.status(404).send();
        }

        res.send(tasks);
    } catch (e) {
        res.status(500).send();
    }
});

app.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send({error: 'Invalid id'});
    }

    try {
        const task = await Task.findById(_id);

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

app.patch('/tasks/:id', async (req, res) => {
    const _id = req.params.id;
    const body = req.body;
    const allowedUpdates = ['description', 'completed'];
    const updates = Object.keys(body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send({error: 'Invalid id'});
    }

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid update field'});
    }

    try {
        const task = await Task.findByIdAndUpdate(_id, body, {new: true, runValidators: true});

        if (!task) {
            return res.status(404).send();
        }

        res.status(200).send(task);
    } catch (e) {
        if (e._message == 'Validation failed') {
            res.status(400).send(e);
        } else {
            res.status(500).send(e);
        }
    }
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
