const User = require("../Models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "nishikathakur4918@gmail.com",
    pass: "ahjnlghhzwwfetlt",
  },
});

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "login",
    path: "/login",
    isAuthenticated: false,
    errorMessage: message,
    oldInfo: {
      email: "",
      password: "",
    },
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInfo: {
        email: email,
        password: password,
      },
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          isAuthenticated: false,
          errorMessage: "Invalid Email or Password",
          oldInfo: {
            email: email,
            password: password,
          },
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            path: "/login",
            isAuthenticated: false,
            errorMessage: "Invalid Email or Password",
            oldInfo: {
              email: email,
              password: password,
            },
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    isAuthenticated: false,
    errorMessage: message,
    oldInfo: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInfo: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
    });
  }
  bcrypt.hash(password, 12).then((hashPassword) => {
    const user = new User({
      email: email,
      password: hashPassword,
      cart: { items: [] },
    });
    return user.save().then(() => {
      // Send a welcome email to the user
      transporter.sendMail({
        to: email,
        subject: "Welcome to Your App",
        html: "Thank you for signing up! Your registration is complete.",
      });
      res.redirect("/login");
    });
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "Please Enter a valid email");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 360000;
        return user.save();
      })
      .then((result) => {
        transporter.sendMail({
          to: result.email,
          subject: "Reset Password Link",
          html: `<h3>Below is your reset password link</h3><a href="http://localhost:3000/reset/${token}">Click here to Reset Password</a>`,
        });
        res.redirect("/login");
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({ resetToken: token })
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      } else {
        const resetTokenExpiration = new Date(user.resetTokenExpiration);
        const currentDate = new Date();
        if (resetTokenExpiration > currentDate) {
          let message = req.flash("error");
          if (message.length > 0) {
            message = message[0];
          } else {
            message = null;
          }
          res.render("auth/new-password", {
            pageTitle: "New Password",
            path: "/new-password",
            isAuthenticated: false,
            errorMessage: message,
          });
        } else {
          return res.redirect("/login");
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
