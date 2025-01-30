import express from 'express';
import { getAllOrder, getOrder } from '../controllers/order.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get(
    '/',
    protectRoute,
    getAllOrder
);

router.get(
    '/:id',
    protectRoute,
    getOrder
);

export default router;
