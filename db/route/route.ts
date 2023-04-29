import express from 'express'
const router = express.Router()
import { registerUser, loginUser, getMe, getUserById, updateUserById, deleteUserById, updateUserPasswordById, getAll } from '../controller/controller'
import { protect } from '../../middleware/authMiddleware'

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)
router.get('/all', getAll)
router.get('/:id', getUserById )
router.put('/:id', updateUserById )
router.put('/password/:id', updateUserPasswordById )
router.delete('/:id', deleteUserById )

export default router