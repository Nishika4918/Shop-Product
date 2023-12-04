const Product = require("../Models/product");
const Order = require("../Models/order");
const fs = require('fs');
const path = require('path');
const PdfDocument = require('pdfkit');
const ItemsPerPage = 1;

//FOR MONGO DB

exports.getAllProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find().count().then(prodNumber => {
      totalItems = prodNumber;
      return  Product.find().skip((page-1) * ItemsPerPage).limit(ItemsPerPage);
    })
    .then((products) => {
        res.render("shop/product-list", {
          pageTitle: "Products",
          path: "/products",
          prod: products,
          currentPage: page,
          hasNextPage: ItemsPerPage * page < totalItems ,
          hasPreviousPage: page>1,
          nextPage: page +1,
          previousPage:page-1,
          lastPage: Math.ceil(totalItems / ItemsPerPage)
        });
      })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find().count().then(prodNumber => {
    totalItems = prodNumber;
    return  Product.find().skip((page-1) * ItemsPerPage).limit(ItemsPerPage);
  })
  .then((products) => {
      res.render("shop/index", {
        pageTitle: "Shop",
        path: "/",
        prod: products,
        currentPage: page,
        hasNextPage: ItemsPerPage * page < totalItems ,
        hasPreviousPage: page>1,
        nextPage: page +1,
        previousPage:page-1,
        lastPage: Math.ceil(totalItems / ItemsPerPage)
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        pageTitle: "Product Detail",
        path: "/products",
        product: product
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  return req.user.populate("cart.items.productId").then((user) => {
      const products = user.cart.items;
      res.render("shop/cart",{pageTitle:"Cart",path:"/cart",products:products})
  });
};


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
     res.redirect('/cart');
    });
};

exports.deleteFromCart = (req, res, next) => {
  const productId = req.body.productId;
  req.user.deleteFromCart(productId).then((result) => {
    res.redirect("/cart");
  });
};


exports.getOrders = (req, res, next) => {
  Order.find({'user.userId':req.user._id}).then(result=>{
    res.render("shop/orders", {
          pageTitle: "Orders",
          path: "/orders",
          orders: result
    });
  })
};


exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.productId').then(user =>{
        const product = user.cart.items.map(i=>{
            return { quantity : i.quantity , product : {...i.productId._doc}}
        })
        const userData = {
            email: req.user.email,
            userId : req.user._id
        }
        const order = new Order({
            products : product,
            user : userData
        })
        return order.save();
    }).then(result=>{
      return req.user.clearCart();
    }).then(() =>{
        res.redirect('/orders');
    }).catch(err => {
        console.log(err)
    })
};

exports.getOrderInvoice = (req,res,next) =>{
  const orderId = req.params.orderId;
  Order.findById(orderId).then(order => {
    if(!order){
      return next('No order');
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      return next('Not Authorized');
    }
    const invoiceName = 'invoice-'+orderId+'.pdf';
    const invoicePath = path.join('Invoices',invoiceName);
    let totalPrice = 0;

    const pdfDoc = new PdfDocument()
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','inline;filename="'+invoiceName+'"');
    pdfDoc.pipe(res);

    pdfDoc.fontSize(20).text('Invoice');
    pdfDoc.fontSize(14).text('OrderId : '+order._id);
    order.products.forEach(prod =>{ 
        totalPrice = totalPrice + prod.quantity * prod.product.price;
        pdfDoc.text('----------------------------------');
        pdfDoc.fontSize(12).text('Product Name : '+prod.product.title);
        pdfDoc.text('Product Price : '+ prod.product.price);
        pdfDoc.text('Quantity : ' + prod.quantity);
    })
    pdfDoc.text('---------------------------------');
    pdfDoc.text('Total Price : ' + totalPrice);
    pdfDoc.end();

  }).catch(err=>{console.log(err)})
}

