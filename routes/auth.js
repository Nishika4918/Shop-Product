const express = require("express");
const router = express.Router();
const _auth = require("../Controllers/authController");
const User = require("../Models/user");
const { check, body } = require("express-validator");

router.get("/login", _auth.getLogin);
router.post("/login",
  [
    body('email').isEmail().withMessage('Please Enter a valid Email Address').normalizeEmail(),
    body('password','Password has to be valid').trim()
  ],
_auth.postLogin);
router.post("/logout", _auth.postLogout);
router.get("/signup", _auth.getSignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Enter a Valid Email Address")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject('This Email already exists. Enter new Email Address')
          }
        });
      }).normalizeEmail(),
    check(
      "password",
      "Please Enter a password with atleast 6 character length and only Alphanumeric"
    )
      .isLength({ min: 6 })
      .isAlphanumeric().trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passowrd and Confirm password must be same");
      }
      return true;
    }).trim(),
  ],
  _auth.postSignup
);
router.get("/reset", _auth.getReset);
router.post("/reset", _auth.postReset);
router.get("/reset/:token", _auth.getNewPassword);

module.exports = router;
