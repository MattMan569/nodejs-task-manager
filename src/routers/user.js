const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const {sendWelcomeEmail, sendCancelationEmail} = require('../emails/account');

const router = new express.Router();

const upload = multer({
    limits: {
        fileSize: 1000000, // 1 MB
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpe?g|png|gif|bmp|tiff?)$/)) {
            callback(new Error('File must be an image (.jpeg, .jpg, .png, .gif, .bmp, .tiff, .tif'));
        }

        callback(undefined, true);
    },
});

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
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
        sendCancelationEmail(user.email, user.name);
        res.send(user);
    } catch (e) {
        res.status(500).send();
    }
});

// Crop the image to 250px x 250px then save it to the db
router.post('/users/me/avatar', [auth, upload.single('avatar')], async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer).png().resize(250, 250).toBuffer();

    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png').send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
