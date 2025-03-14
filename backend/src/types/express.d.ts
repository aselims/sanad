import { User } from '../entities/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }

    interface User {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      // Add other properties as needed
    }
  }
} 