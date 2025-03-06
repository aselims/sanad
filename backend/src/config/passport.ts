import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { AppDataSource } from './data-source';
import { User } from '../entities/User';
import { comparePassword } from '../utils/password';
import logger from '../utils/logger';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

// Configure JWT strategy options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

// Configure local strategy options
const localOptions = {
  usernameField: 'email',
  passwordField: 'password',
};

// Initialize passport strategies
export const initializePassport = () => {
  // JWT Strategy
  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: payload.id } });

        if (!user) {
          return done(null, false);
        }

        if (!user.isActive) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        logger.error(`Error in JWT strategy: ${error}`);
        return done(error, false);
      }
    })
  );

  // Local Strategy (email/password)
  passport.use(
    new LocalStrategy(localOptions, async (email, password, done) => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
          where: { email },
          select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive', 'isVerified'],
        });

        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        if (!user.isActive) {
          return done(null, false, { message: 'User account is inactive' });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }

        // Remove password from user object before returning
        delete user.password;
        return done(null, user);
      } catch (error) {
        logger.error(`Error in Local strategy: ${error}`);
        return done(error);
      }
    })
  );
}; 