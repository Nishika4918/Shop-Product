const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  resetToken :String,
  resetTokenExpiration : Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          require: true,
          ref: "Product",
        },
        quantity: { type: Number, require: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  let newCartIndex = this.cart.items.findIndex((item) => {
    return item.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  let updatedCartItems = [...this.cart.items];

  if (newCartIndex >= 0) {
    newQuantity = this.cart.items[newCartIndex].quantity + 1;
    updatedCartItems[newCartIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({ 
      productId: product._id, 
      quantity: newQuantity 
    });
  }
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteFromCart = function(productid){
    const updatedCartItems = this.cart.items.filter((x) => {
      return x.productId != productid;
    });
    const updatedCart = { items: updatedCartItems };
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.clearCart = function(){
  this.cart = { items: [] };
  return this.save();
}

module.exports = mongoose.model("User", userSchema);













// const mongoDb = require("mongodb");
// const getDb = require("../util/database").getDb;
// const ObjectId = mongoDb.ObjectId;
// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection("users").insertOne(this);
//   }

//   addToCart(product) {
//     const db = getDb();
//     let newQuantity = 1;
//     let updatedCartItems = [...this.cart.items];
//     let newCartIndex = this.cart.items.findIndex((item) => {
//       return item.productId.toString() === product.id.toString();
//     });
//     if (newCartIndex >= 0) {
//       newQuantity = this.cart.items[newCartIndex].quantity + 1;
//       updatedCartItems[newCartIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({ productId: product.id, quantity: newQuantity });
//     }
//     const updatedCart = { items: updatedCartItems };
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   getCartItems() {
//     const db = getDb();
//     const productIds = this.cart.items.map((x) => {
//       return x.productId;
//     });
//     return db
//       .collection("products")
//       .find({ id: { $in: productIds } })
//       .toArray()
//       .then((product) => {
//         return product.map((prod) => {
//           return {
//             ...prod,
//             quantity: this.cart.items.find((i) => {
//               return i.productId.toString() === prod.id;
//             }).quantity,
//           };
//         });
//       });
//   }

//   deleteFromCart(productid) {
//     const db = getDb();
//     const updatedCartItems = this.cart.items.filter((x) => {
//       return x.productId != productid;
//     });
//     const updatedCart = { items: updatedCartItems };
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   static findById(id) {
//     const db = getDb();
//     return db.collection("users").findOne({ _id: new ObjectId(id) });
//   }

//   addOrders() {
//     const db = getDb();
//     return this.getCartItems().then((products) => {
//       const order = {
//         item: { products },
//         userInfo: { id: new ObjectId(this._id), name: this.name },
//       };
//       return db
//         .collection("Orders")
//         .insertOne(order)
//         .then((result) => {
//           this.cart = { items: [] };
//           const updatedCart = { items: [] };
//           return db
//             .collection("users")
//             .updateOne(
//               { _id: new ObjectId(this._id) },
//               { $set: { cart: updatedCart } }
//             );
//         });
//     });
//   }

//   getOrders(){
//     const db = getDb();
//     return db.collection("Orders").find({'userInfo.id':new ObjectId(this._id)}).toArray();
//   }
// }

// module.exports = User;
