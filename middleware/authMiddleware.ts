import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { collections } from '../db/services/database.service'
import dotenv from "dotenv"

dotenv.config()

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
      // Get user from the token
      req.user = await collections?.users?.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      res.status(401)
      throw new Error('Not authorized')
    }
  }
  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})