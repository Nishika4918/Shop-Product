const Product = require("../Models/product");
const { validationResult } = require("express-validator");
const fileRemove = require('../util/file');

// GET ADD PRODUCT PAGE
exports.getAddProductPage = (req, res, next) => {
  const product = new Product();
  res.render("admin/edit-product", {
    path: "/admin/add-product",
    pageTitle: "Add Product",
    product: product,
    editing: false,
    hasError:false,
    errorMessage :null
  });
};

// ADD NEW PRODUCT
exports.postAddProductPage = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if(!image){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      product: {
        title:title,
        price:price,
        description:description
      },
      editing: false,
      hasError:true,
      errorMessage: 'Please select a Image',
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      product: {
        title:title,
        price:price,
        description:description
      },
      editing: false,
      hasError:true,
      errorMessage: errors.array()[0].msg,
    });
  }

  const imageUrl = image.path;
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId:req.user
  });

  product
    .save()
    .then((result) => console.log("created"))
    .catch((err) => {
      console.log(err);
    });
  res.redirect("/");
};

// GET ALL PRODUCT WITH Admin
exports.getProductsPage = (req, res, next) => {
  Product.find({userId:req.user._id})
    .then((products) => {
      res.render("admin/products", {
        pageTitle: "Admin Products",
        path: "/admin/products",
        prod: products
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// GET EDIT PAGE WITH VALUES
exports.getEditProductPage = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("admin/edit-product", {
        path: "/admin/edit-product",
        pageTitle: "Edit Product",
        editing: editMode,
        product: product,
        hasError:false,
        errorMessage:null
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// POST EDIT PAGE WITH DIFFERENT VALUES
exports.postEditProductPage = (req, res, next) => {
  const productId = req.body.id;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      product: {
        title:updatedTitle,
        price:updatedPrice,
        description:updatedDescription,
        id : productId
      },
      editing: true,
      hasError:true,
      errorMessage: errors.array()[0].msg,
    });
  }

  Product.findById(productId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      if(image){
        // fileRemove.deleteFile(product.imageUrl)
        product.imageUrl = image.path;
      }
      return product.save();
    })
    .then((result) => {
      res.redirect("products");
    });
};

// POST EDIT WITHOUT RELOAD


// DELETE PRODUCT FROM DATABASE
// exports.deleteProduct = (req, res, next) => {
//   const productId = req.body.id;
//   Product.findByIdAndRemove(productId)
//     .then(() => {
//       console.log("deleted");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
//   res.redirect("/"); 
// };

// DELETE WITHOUT PAGE RELOAD
exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;
   Product.findById(productId).then(product => {
      return Product.findByIdAndRemove(productId);
   }).then(()=>{
      res.status(200).json({message:'Success'})
   }).catch(err=>{
     res.status(500).json({message:'Deleteing product failed'}
     )})
};

