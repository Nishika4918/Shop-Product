const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
  title:{
    type:String,
    require:true
  },
  price:{
    type:Number,
    require:true
  },
  description:{
    type:String,
    require:true
  },
  imageUrl:{
    type:String,
    require:true
  },
  userId:{
    type:Schema.Types.ObjectId,
    require:true,
    ref:'User'
  }
})

module.exports = mongoose.model('Product',productSchema); // here Product is the model name  and other one is schema name











// const getDb = require('../util/database').getDb;  

// class Product {
//    constructor(id,title, imageUrl, description, price,userId) {
//     this.id =id;
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//     this.userId = userId;
//   }

//   save (){
//     const db = getDb();
//     let dbOb;
//     if(this.id){
//       //Update
//       console.log('updating')
//       dbOb = db.collection('products').updateOne({id:this.id},{$set:this})
//     }
//     else{
//       //CREATE
//       this.id = Math.random().toString();
//       dbOb = db.collection('products').insertOne(this)
//     }
//     return dbOb.then(result=>{})
//       .catch(err=>{console.log(err)});
//   }

//   static fetchall(){
//     const db = getDb();
//     return db.collection('products').find().toArray().then(products=>{return products}).catch(err=>{console.log(err)});
//   }

//   static findById(productId){
//     const db = getDb();
//     return db.collection('products')
//     .find({id:productId})
//     .next()
//     .then(product=>{return product})
//     .catch(err=>{console.log(err)})
    
//   }

//   static deleteById(id){
//    const db = getDb();
//    return db.collection('products')
//    .deleteOne({id:id})
//    .then(()=>{console.log('product deleted!')})
//    .catch(err=>{console.log(err)});
//   } 

// }

// module.exports = Product;

