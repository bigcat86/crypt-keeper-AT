const router = require('express').Router();
const withAuth = require('../../utils/auth');
const bcrypt = require('bcrypt');
const { User, Coin, Portfolio, PortfolioCoin } = require('../../models');

// Pull user data
router.get('/', async (req, res) => {
    try {
        const userData = await User.findAll({
            include: [{ model: Portfolio }]
        });
        res.status(200).json(userData);
    } catch (error) {
        console.log(error);
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const userData = await User.create({
            user_name: req.body.user_name,
            email: req.body.email,
            password: req.body.password
        });
        req.session.save(() => {
            req.session.userId = userData.id;
            req.session.loggedIn = true;
            res.status(200).json(userData);
        });
    } catch (err) {
        res.status(400).json(err);
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        // Try to find the user with the given email address
        const userData = await User.findOne({ where: { email: req.body.email } });

        if (!userData) {
            res
                .status(400)
                .json({ message: 'Incorrect email or password, please try again' });
            return;
        }

        // Use bcrypt to compare the provided password with the stored hashed password
        const validPassword = await bcrypt.compare(
            req.body.password,
            userData.password
        );

        if (!validPassword) {
            res
                .status(400)
                .json({ message: 'Incorrect email or password, please try again' });
            return;
        }

        // If the email and password are valid, create a new session
        req.session.save(() => {
            req.session.userId = userData.id;
            req.session.loggedIn = true;

            res.status(200).json({ user: userData, message: 'You are now logged in!' });
        });

        res.render('homepage');

    } catch (err) {
        res.status(500).json(err);
    }
});

// Logout
router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

module.exports = router;