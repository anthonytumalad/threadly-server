import type  { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    })

    if (existingUser) {
      res.status(400).json({ message: 'Email or username already taken' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: { email, username, password: hashedPassword },
      select: { id: true, email: true, username: true, createdAt: true }
    })

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(201).json({ user: newUser, token })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' })
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid credentials' })
      return
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      user: { id: user.id, email: user.email, username: user.username },
      token
    })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, username: true, bio: true, avatar: true, createdAt: true }
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
}