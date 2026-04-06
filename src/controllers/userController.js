const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { z } = require('zod');

exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find().select('-password');

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

const roleSchema = z.object({
    role: z.enum(['Viewer', 'Analyst', 'Admin'])
});

exports.updateUserRole = asyncHandler(async (req, res, next) => {
    const { role } = roleSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        {
            new: true,
            runValidators: true
        }
    ).select('-password');

    if (!user) {
        return next(new AppError('No user found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

const statusSchema = z.object({
    isActive: z.boolean()
});

exports.updateUserStatus = asyncHandler(async (req, res, next) => {
    const { isActive } = statusSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        {
            new: true,
            runValidators: true
        }
    ).select('-password');

    if (!user) {
        return next(new AppError('No user found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});
