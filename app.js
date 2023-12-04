const express = require("express");
const session = require("express-session");
const csrf = require('csurf');
const flash = require('connect-flash');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const adminRouter = require("./routes/admin");
const shopRoute = require("./routes/shop");
const authRoute = require("./routes/auth");
const path = require("path");
const _nf = require("./Controllers/notfoundController");
const User = require("./Models/user");
const MongodbStore = require("connect-mongodb-session")(session);
const nodemailer = require('nodemailer');
const multer = require('multer');

// URL TO CONNECT WITH MONGODB DATABASE
const mongoDb_Url =
  "mongodb+srv://thakurnishika2001:ZIoO9gHEnObVc53C@cluster0.jyxxmwf.mongodb.net/shop?retryWrites=true&w=majority";

// Created an instance of the Express application.
const app = express();

// Created an instance of MongodbStore to store session data in MongoDB.
const store = new MongodbStore({
  uri: mongoDb_Url,
  collection: "sessions",
});

// CSRF protection using the csurf middleware.
const csrfProtection = csrf();

// TO SET THE IMAGE FILE PATH
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,'Images');
  },
  filename: (req, file, cb) => {
    const sanitizedDate = new Date().toISOString().replace(/:/g, '-'); // Replace colons with hyphens
    cb(null, sanitizedDate + '-' + file.originalname);
  }
});


// Use the EJS template engine for rendering views
app.set("view engine", "ejs");
app.set("views", "views");

// This middleware is used to parse form data in the request body.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage : fileStorage}).single('image'));
app.use(express.static(path.join(__dirname, "public")));
app.use('/Images',express.static(path.join(__dirname, "Images")));

//This section configures and uses the express-session middleware to manage user sessions
app.use(
  session({
    secret: "this is my secret key",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//apply CSRF protection and flash message middleware to your Express app
app.use(csrfProtection);
app.use(flash())

// This middleware checks if a user is authenticated and attaches user data to the request object if they are.
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});


//This middleware sets local variables that can be accessed in your EJS templates, making it easy to check if a user is authenticated and to include CSRF tokens in forms.
app.use((req,res,next) =>{
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})


app.use("/admin", adminRouter);
app.use(shopRoute);
app.use(authRoute);
app.use(_nf.notFound);

mongoose
  .connect(mongoDb_Url)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
