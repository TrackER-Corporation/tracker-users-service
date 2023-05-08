import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import { collections } from '../services/database.service'

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const ObjectId = require("mongodb").ObjectId;
export const registerUser = asyncHandler(async (req: any, res: any) => {
  const { name, surname, email, password, type } = req.body

  if (!name || !surname || !email || !password) {
    res.status(400)
    throw new Error('Invalid user data')
  }

  // Check if user exists
  const userExists = await collections?.users?.findOne({ email: email })
  if (userExists != null) {
    res.status(400)
    throw new Error('Invalid user data')
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create user
  const user: any = await collections?.users?.insertOne({
    name,
    surname,
    email,
    password: hashedPassword,
    type
  })
  if (user) {
    res.status(200).json({
      _id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: hashedPassword,
      type: type,
      token: generateToken(user._id),
    })
  } else {
    res.status(402)
    throw new Error('Invalid user data')
  }
})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body

  // Check for user email
  const user = await collections?.users?.findOne({ email })
  const crypt = await bcrypt.compare(password, user?.password)
  if (user && crypt) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: user.password,
      token: generateToken(user._id),
      type: user.type
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req: any, res: any) => {
  res.status(200).json(req.user)
})

// Generate JWT
const generateToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  })
}
// Getting user By ID
export const getUserById = asyncHandler(async (req: any, res: any) => {
  if (!req.params.id) {
    res.status(400)
    throw new Error('Invalid user data')
  }
  let myQuery = { _id: new ObjectId(req.params.id) };
  const user = await collections?.users?.findOne(myQuery);
  if (!user) {
    res.status(400)
  } else {
    res.status(200).json(user)
  }
})

// @desc    Update user by Id
// @route   PUT /api/user/:id
// @access  Private
export const updateUserById = asyncHandler(async (req: any, res: any) => {
  if (!req.params.id) {
    res.status(400)
    throw new Error('Invalid user data')
  }
  const user = await collections?.users?.findOne(new ObjectId(req.params.id))

  if (!user) {
    res.status(400)
    throw new Error('Invalid user data')
  }

  // Make sure the logged in user matches the goal user
  if (user._id.toString() !== new ObjectId(req.params.id).toString()) {
    res.status(402)
    throw new Error('Invalid user data')
  }
  const updatedUser = await collections?.users?.findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    { $set: { ...req.body } },
    { returnDocument: 'after' }
  )
  res.status(200).json(updatedUser)
})

// @desc    Update user by Id
// @route   PUT /api/user/password/:id
// @access  Private
export const updateUserPasswordById = asyncHandler(async (req: any, res: any) => {
  if (!req.params.id) {
    res.status(400)
    throw new Error('Invalid user data')
  }
  const { password } = req.body
  const user = await collections?.users?.findOne(new ObjectId(req.params.id))

  if (!user) {
    res.status(400)
    throw new Error('Invalid user data')
  }

  // Make sure the logged in user matches the goal user
  if (user._id.toString() !== new ObjectId(req.params.id).toString()) {
    res.status(402)
    throw new Error('Invalid user data')
  }
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const updatedUserPassword = await collections?.users?.findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    { $set: { password: hashedPassword } },
    { returnDocument: 'after' }
  )
  res.status(200).json(updatedUserPassword)
})

// @desc    Delete User
// @route   DELETE /api/user/:id
// @access  Private
export const deleteUserById = asyncHandler(async (req: any, res: any) => {
  if (!req.params.id) {
    res.status(400)
    throw new Error('Invalid user data')
  }
  const user = await collections?.users?.findOne({ _id: new ObjectId(req.params.id) })
  if (!user) {
    res.status(400)
    throw new Error('Invalid user data')
  }

  if (user.type === "Vendor") {
    fetch(`http://localhost:3000/api/organization/user/${req.params.id}`, { method: 'DELETE' }).catch(error => { })
  } else {
    fetch(`http://localhost:3000/api/buildings/user/${req.params.id}`, { method: 'DELETE' }).catch(error => { })
  }
  fetch(`http://localhost:3000/api/preference/${req.params.id}`, { method: 'DELETE' }).catch(error => { })

  await collections.users?.deleteOne({ _id: new ObjectId(req.params.id) });
  res.status(200).json({ id: req.params.id })
})

export const getAll = asyncHandler(async (req: any, res: any) => {
  const goal = await collections?.users?.find({}).toArray()
  if (goal!.length > 0)
    res.status(200).json(goal)
})