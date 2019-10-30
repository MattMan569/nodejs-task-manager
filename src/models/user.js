const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Your password may not contain the word "password"');
            }
        },
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number');
            }
        },
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        },
    }],
});

// Virtual property - setup relation between tasks and users
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
});

// Implicitly called whenever the user is sent to the requester,
// removing all private data before doing so.
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.tokens;

    return user;
};

userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({_id: this._id.toString()}, process.env.UdemyNodeJsJwtSecret);

    this.tokens = this.tokens.concat({token});
    await this.save();

    return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    const loginError = new Error('Unable to login');

    if (!user) {
        throw loginError;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw loginError;
    }

    return user;
};

// Hash the plain text password before saving
// Must be a standard function as this must be binded
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }

    next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
    await Task.deleteMany({owner: this._id});

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
