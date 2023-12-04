const express = require('express');
const router = express.Router();
const _sc = require('../Controllers/shopController');
const isAuth = require('../middleware/is-auth');

router.get('/', _sc.getIndex);
router.get('/products',_sc.getAllProducts);
router.get('/product/:productId',_sc.getProduct);
router.get('/cart' ,isAuth ,_sc.getCart);
router.post('/cart' ,isAuth , _sc.postCart);
router.post('/cart-item-delete' ,isAuth , _sc.deleteFromCart);
router.get('/orders' ,isAuth ,_sc.getOrders);
router.get('/orders/:orderId', isAuth, _sc.getOrderInvoice);
router.post('/create-order' ,isAuth , _sc.postOrder);


module.exports = router;
