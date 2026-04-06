const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { z } = require('zod');

const DEFAULT_JWT_SECRET = 'fallback_secret_for_development';

const signToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || DEFAULT_JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from response payload
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['Viewer', 'Analyst', 'Admin']).optional()
});

exports.register = asyncHandler(async (req, res, next) => {
    const validatedData = registerSchema.parse(req.body);

    // Make the first registered user an Admin automatically
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'Admin' : (validatedData.role || 'Viewer');

    const newUser = await User.create({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        role
    });

    createSendToken(newUser, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Email and password are required.', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        return next(new AppError('Incorrect email or password.', 401));
    }

    if (!user.isActive) {
        return next(new AppError('Your account has been deactivated. Contact an administrator.', 403));
    }

    createSendToken(user, 200, res);
});
