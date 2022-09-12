const asyncHandler = require("express-async-handler")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/userModel')

//@desc     Register new User
//@route    POST /api/users
//@access   public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if(!name || !email || !password) {
        res.status(400)
        throw new Error('Please add all required fields.')
    }

    //check if user exists
    const userExists = await User.findOne({ email })

    if(userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    //Hash user Password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    })

    if(user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data.')
    }
})

//@desc     Authenticate User
//@route    POST /api/users/login
//@access   Public
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    //check for user email
    const user = await User.findOne({ email })

    //check user password
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      throw new Error("Invalid crendentials")
    }

  res.status(200).json({ message: 'Login User' })
})

//@desc     Get User Data
//@route    GET /api/users/me
//@access   Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user)
})

//Generate Token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    })
}


module.exports = {
    registerUser,
    getMe,
    loginUser,
}