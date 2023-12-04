const express = require('express');
const router = express.Router();
const _ac = require('../Controllers/adminController');
const isAuth = require('../middleware/is-auth');
const { check, body } = require("express-validator");

router.get('/add-product',isAuth,_ac.getAddProductPage);
router.get('/products' ,isAuth , _ac.getProductsPage);
router.post('/add-product', [
    body('title','Enter a valid title with 3 Characters long').isString().isLength({min :3}).trim(),
    body('price','Enter a valid price').isFloat(),
    body('description','Enter a valid description with atleast 5 characters').isLength({min:5}).trim()
] ,isAuth ,_ac.postAddProductPage);
router.get('/edit-product/:productId' ,isAuth ,_ac.getEditProductPage)
router.post('/edit-product',[
    body('title','Enter a valid title with 3 Characters long').isString().isLength({min :3}).trim(),
    body('price','Enter a valid price').isFloat(),
    body('description','Enter a valid description with atleast 5 characters').isLength({min:5}).trim()
] ,isAuth , _ac.postEditProductPage);

// router.post('/delete-product' ,isAuth , _ac.deleteProduct);
router.delete('/products/:productId' ,isAuth , _ac.deleteProduct);

module.exports = router;


// body('imageUrl','Enter a Valid Url').isURL().trim(),