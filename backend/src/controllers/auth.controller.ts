import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { AppError } from '../middlewares/errorHandler';
import { hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import logger from '../utils/logger';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, role = UserRole.INNOVATOR } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return next(new AppError('First name, last name, email, and password are required', 400));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Invalid email format', 400));
    }

    // Validate password strength
    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }

    // Check if user already exists
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    // Save user to database
    await userRepository.save(newUser);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    // Generate JWT token
    const token = generateToken(newUser);

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    logger.error(`Error in register controller: ${error}`);
    return next(new AppError('Error registering user', 500));
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(new AppError(`Authentication error: ${err.message}`, 500));
    }

    if (!user) {
      return next(new AppError(info?.message || 'Invalid email or password', 401));
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  })(req, res, next);
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
export const getCurrentUser = (req: Request, res: Response) => {
  return res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

/**
 * Change password
 * @route POST /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req.user as any).id;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return next(new AppError('Current password and new password are required', 400));
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return next(new AppError('New password must be at least 8 characters long', 400));
    }

    // Get user with password
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Verify current password
    const isMatch = await passport.authenticate('local', { session: false });
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    await userRepository.save(user);

    return res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error(`Error in changePassword controller: ${error}`);
    return next(new AppError('Error changing password', 500));
  }
}; 