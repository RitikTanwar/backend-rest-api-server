const User = require("../models/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const shortid = require("shortid");

exports.signup = (req, res) => {
  User.findOne({
    email: req.body.email,
  }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        message: "Username already taken",
      });
    const { firstName, lastName, email, password } = req.body;
    const hashpassword = await bcrypt.hash(password, 10);
    const _user = new User({
      firstName,
      lastName,
      email,
      hashpassword,
      username: shortid.generate(),
    });

    _user.save((error, data) => {
      if (error) {
        return res.status(400).json({
          message: "Something went wrong " + error,
        });
      }
      if (data) {
        return res.status(201).json({
          message: "User is created Successfully",
        });
      }
    });
  });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (err, user) => {
    if (err) return res.status(400).json({ err });
    if (user) {
      const userPassword = await user.authenticate(req.body.password);

      if (userPassword && user.role === "user") {
        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        const { _id, firstName, lastName, email, role, fullName } = user;
        res.status(200).json({
          token,
          user: {
            _id,
            firstName,
            lastName,
            email,
            role,
            fullName,
          },
        });
      } else {
        return res.status(400).json({
          message: "Invalid Credentials",
        });
      }
    } else {
      return res.status(400).json({ message: "Something went wrong" });
    }
  });
};
