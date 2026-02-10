const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Routine = require('../models/Routine');

// @route   POST api/routines
// @desc    Add a daily routine
// @access  Private
router.post('/', auth, async (req, res) => {
    const { sleepHours, studyHours, screenTime, mood, date } = req.body;

    // Backend Validation
    if (sleepHours === undefined || studyHours === undefined || screenTime === undefined || mood === undefined) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (sleepHours < 0 || studyHours < 0 || screenTime < 0) {
        return res.status(400).json({ success: false, message: 'Values cannot be negative' });
    }

    if (mood < 1 || mood > 5) {
        return res.status(400).json({ success: false, message: 'Mood must be between 1 and 5' });
    }

    try {
        const newRoutine = new Routine({
            sleepHours,
            studyHours,
            screenTime,
            mood,
            date: date || Date.now(),
            user: req.user.id
        });

        const routine = await newRoutine.save();

        res.status(201).json({ success: true, data: routine });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET api/routines
// @desc    Get all routines for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const routines = await Routine.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(routines);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
