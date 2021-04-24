const { Router } = require('express');
const authRoutes = require('./auth.route');

const router = Router();

router.use('/auth', authRoutes);

module.exports = router;
