declare global {
  namespace Express {
    interface User {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      // Add other properties as needed
    }

    interface Request {
      user?: User;
    }
  }
}
