const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

// GET /tasks?completed=bool                - match
// GET /tasks?limit=number&skip=number      - pagination
// GET /tasks?sortBy=field:(asc|desc)       - sorting
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            },
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send({error: 'Invalid id'});
    }

    try {
        // Only return tasks the current user has created
        const task = await Task.findOne({_id, owner: req.user._id});

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
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
        const task = await Task.findOne({_id, owner: req.user._id});

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => task[update] = body[update]);
        await task.save();

        res.send(task);
    } catch (e) {
        if (e._message == 'Validation failed') {
            res.status(400).send(e);
        } else {
            res.status(500).send(e);
        }
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send({error: 'Invalid id'});
    }

    try {
        // const task = await Task.findByIdAndDelete(_id);
        const task = await Task.findOneAndDelete({_id, owner: req.user._id});

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
