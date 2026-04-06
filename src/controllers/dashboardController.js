const Record = require('../models/Record');
const asyncHandler = require('../utils/asyncHandler');

exports.getSummary = asyncHandler(async (req, res, next) => {
    // Summary page values are built from the existing financial records.

    // 1. Aggregate total income and total expenses by type.
    const totals = await Record.aggregate([
        {
            $group: {
                _id: '$type',
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;

    totals.forEach((summary) => {
        if (summary._id === 'income') totalIncome = summary.totalAmount;
        if (summary._id === 'expense') totalExpenses = summary.totalAmount;
    });

    const netBalance = totalIncome - totalExpenses;

    // 2. Group totals by type and category to show trends.
    const categoryTotals = await Record.aggregate([
        {
            $group: {
                _id: { type: '$type', category: '$category' },
                totalAmount: { $sum: '$amount' }
            }
        },
        {
            $project: {
                _id: 0,
                type: '$_id.type',
                category: '$_id.category',
                totalAmount: 1
            }
        },
        { $sort: { totalAmount: -1 } }
    ]);

    // 3. Fetch the latest activity to show recent records.
    const recentActivity = await Record.find()
        .sort({ date: -1 })
        .limit(5)
        .populate('createdBy', 'name email');

    res.status(200).json({
        status: 'success',
        data: {
            totalIncome,
            totalExpenses,
            netBalance,
            categoryTotals,
            recentActivity
        }
    });
});
