import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { collections } from '../db/services/database.service'

export const protect = asyncHandler(async (req: any, res: any, next: any) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]
      // Verify token
      console.log(token)
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
      // Get user from the token
      console.log(decoded)
      req.user = await collections?.users?.findById(decoded.id).select('-password')
      console.log(req.user)
      next()
    } catch (error) {
      console.log(error)
      res.status(401)
      throw new Error('Not authorized')
    }
  }
  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})