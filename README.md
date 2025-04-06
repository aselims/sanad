# Sanad - Innovation Collaboration Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI/CD](https://github.com/aselims/sanad/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/aselims/sanad/actions/workflows/ci-cd.yml)

Sanad is an open-source innovation collaboration platform that connects innovators, researchers, startups, and investors to foster collaboration and drive innovation forward.

## Features

- **AI-Powered Matchmaking**: Intelligent matching system to connect compatible innovators
- **Role-Based Profiles**: Specialized profiles for different types of innovators (Startups, Researchers, Investors, etc.)
- **Collaboration Tools**: Built-in tools for managing collaborations and partnerships
- **Real-time Messaging**: Secure communication between users
- **Challenge Management**: Platform for posting and managing innovation challenges
- **Resource Sharing**: Secure file sharing and collaboration space

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- React Router for navigation
- Lucide React for icons

### Backend
- Node.js with TypeScript
- Express.js
- TypeORM for database management
- PostgreSQL database
- JWT for authentication
- OpenAI integration for AI features

### Infrastructure
- Docker for containerization
- Nginx as reverse proxy
- GitHub Actions for CI/CD
- DigitalOcean for hosting

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Docker and Docker Compose (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aselims/sanad.git
cd sanad
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env
```

4. Start the development servers:
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in a new terminal)
cd frontend
npm run dev
```

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries

## Contact

- Project Link: [https://github.com/aselims/sanad](https://github.com/aselims/sanad)
- Website: [https://sanad.selimsalman.de](https://sanad.selimsalman.de) 