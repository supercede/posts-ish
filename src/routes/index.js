const { Router } = require('express');
const authRoutes = require('./auth.route');
const postRoutes = require('./post.route');

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);

module.exports = router;
