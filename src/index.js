const express = require('express');
const mongoose = require('mongoose');
require('./db/mongoose');
const User = require('./models/user');
const Task = require('./models/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/users', (req, res) => {
    const user = new User(req.body);

    user.save().then(() => {
        res.status(201).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/users', (req, res) => {
    User.find({}).then((users) => {
        if (!users) {
            return res.status(404).send();
        }

        res.send(users);
    }).catch((e) => {
        res.status(500).send();
    });
});

app.get('/users/:id', (req, res) => {
    const _id = req.params.id;

    // Properly formatted ids must be a length of 12
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        res.status(400).send();
    }

    User.findById(_id).then((user) => {
        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    }).catch((e) => {
        res.status(500).send(e);
    });
});

app.post('/tasks', (req, res) => {
    const task = new Task(req.body);

    task.save().then(() => {
        res.status(201).send(task);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/tasks', (req, res) => {
    Task.find({}).then((tasks) => {
        if (!tasks) {
            res.status(404).send();
        }

        res.send(tasks);
    }).catch((e) => {
        res.status(500).send();
    });
});

app.get('/tasks/:id', (req, res) => {
    _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        res.status(400).send();
    }

    Task.findById(_id).then((task) => {
        if (!task) {
            res.status(404).send();
        }

        res.send(task);
    }).catch((e) => {
        res.status(500).send();
    });
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
