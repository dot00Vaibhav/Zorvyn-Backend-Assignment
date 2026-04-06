const Record = require('../models/Record');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { z } = require('zod');

const recordSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['income', 'expense']),
    category: z.string().min(1, 'Category is required'),
    date: z.string().optional().transform((value) => value ? new Date(value) : new Date()),
    notes: z.string().optional()
});

exports.createRecord = asyncHandler(async (req, res, next) => {
    const validatedData = recordSchema.parse(req.body);

    const record = await Record.create({
        ...validatedData,
        createdBy: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: {
            record
        }
    });
});

exports.getAllRecords = asyncHandler(async (req, res, next) => {
    const filter = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete filter[field]);

    if (filter.startDate || filter.endDate) {
        filter.date = {};
        if (filter.startDate) filter.date.$gte = new Date(filter.startDate);
        if (filter.endDate) filter.date.$lte = new Date(filter.endDate);
        delete filter.startDate;
        delete filter.endDate;
    }

    const records = await Record.find(filter).sort({ date: -1 });

    res.status(200).json({
        status: 'success',
        results: records.length,
        data: {
            records
        }
    });
});

exports.getRecord = asyncHandler(async (req, res, next) => {
    const record = await Record.findById(req.params.id);

    if (!record) {
        return next(new AppError('No record found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            record
        }
    });
});

exports.updateRecord = asyncHandler(async (req, res, next) => {
    const record = await Record.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!record) {
        return next(new AppError('No record found with that ID.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            record
        }
    });
});

exports.deleteRecord = asyncHandler(async (req, res, next) => {
    const record = await Record.findByIdAndDelete(req.params.id);

    if (!record) {
        return next(new AppError('No record found with that ID.', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
