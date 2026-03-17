import { Router } from 'express'
import { createUser, loginUser, getCurrentUser } from '../controllers/auth.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.post('/register', createUser)
router.post('/login', loginUser)
router.get('/me', authMiddleware, getCurrentUser)

export default router