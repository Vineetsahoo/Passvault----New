# PassVault - Secure Digital Pass & Password Manager

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-username/passvault)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF.svg)](https://vitejs.dev/)

A modern, secure, and user-friendly digital pass and password management application built with React, TypeScript, and modern web technologies.

> **Note**: This project was originally developed in Python and has been completely rebuilt using TypeScript, React, and modern web technologies for enhanced performance, better user experience, and improved maintainability.

## Features

### Security First
- **End-to-End Encryption**: AES-256 encryption for all stored data
- **Zero-Knowledge Architecture**: We can't see your passwords even if we wanted to
- **Two-Factor Authentication**: Enhanced security with 2FA support
- **Biometric Authentication**: Fingerprint and face recognition support
- **Security Score**: Real-time security assessment of your passwords

### Multi-Device Experience
- **Cross-Platform Sync**: Seamless synchronization across all devices
- **Offline Access**: Access your vault even without internet connection
- **Progressive Web App**: Native app-like experience on mobile devices
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### Smart Management
- **Password Generator**: Create strong, unique passwords instantly
- **Breach Monitoring**: Alerts for compromised accounts
- **Expiration Reminders**: Never miss password update deadlines
- **Categorization**: Organize passwords by type and importance
- **Secure Sharing**: Share credentials safely with team members

### Analytics & Insights
- **Security Dashboard**: Comprehensive overview of your digital security
- **Usage Analytics**: Track your password management habits
- **Audit Trail**: Complete history of all password activities
- **Risk Assessment**: Identify and fix security vulnerabilities

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/passvault.git
   cd passvault
   ```

2. **Navigate to client directory**
   ```bash
   cd client
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Credentials

To quickly explore the application, you can use these demo credentials:

```
Email: user@example.com
Password: password
```

**Note**: These are test credentials for demonstration purposes only. All demo data is simulated and no real passwords are stored.

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
passvault/
├── client/                    # Frontend React application
│   ├── public/               # Static assets
│   │   ├── images/          # Image assets
│   │   └── card-pattern.svg # Design patterns
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # Base UI components
│   │   │   ├── dashboard/  # Dashboard-specific components
│   │   │   ├── Navbar.tsx  # Navigation component
│   │   │   ├── Footer.tsx  # Footer component
│   │   │   └── ...
│   │   ├── pages/          # Page components
│   │   │   ├── Home.tsx    # Landing page
│   │   │   ├── About.tsx   # About page
│   │   │   ├── Features.tsx # Features showcase
│   │   │   └── ...
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Main App component
│   │   └── main.tsx        # Entry point
│   ├── package.json        # Dependencies and scripts
│   ├── vite.config.ts      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── tsconfig.json       # TypeScript configuration
└── README.md              # Project documentation
```

## Tech Stack

### Frontend
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.5.3** - Type-safe JavaScript development
- **Vite 5.4.2** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 11.18.0** - Smooth animations and interactions

### UI & Design
- **React Icons 5.4.0** - Comprehensive icon library
- **Lucide React 0.344.0** - Beautiful & consistent icons
- **Headless UI 2.2.0** - Unstyled, accessible UI components
- **Radix UI** - Low-level UI primitives

### State Management & Routing
- **React Router DOM 6.29.0** - Declarative routing
- **React Hot Toast 2.5.1** - Elegant notifications
- **React Toastify 11.0.3** - Toast notifications

### Authentication & Security
- **bcrypt 5.1.1** - Password hashing
- **jsonwebtoken 9.0.2** - JWT token handling
- **helmet 8.0.0** - Security headers
- **express-rate-limit 7.5.0** - Rate limiting

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting
- **Autoprefixer** - CSS vendor prefixes
- **PostCSS** - CSS processing

## Key Components

### Dashboard
The main application interface featuring:
- **Security Overview**: Real-time security score and status
- **Quick Actions**: Fast access to common tasks
- **Recent Activity**: Timeline of password-related actions
- **Statistics**: Comprehensive password analytics

### Password Management
- **Secure Storage**: Encrypted password vault
- **Generator**: Create strong passwords with customizable options
- **Categories**: Organize passwords by type and importance
- **Search**: Quick search and filtering capabilities

### Security Features
- **Breach Monitoring**: Real-time breach detection
- **Two-Factor Authentication**: Enhanced account security
- **Audit Trail**: Complete activity logging
- **Risk Assessment**: Security vulnerability analysis

## Configuration

### Environment Variables
Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000
VITE_ENCRYPTION_KEY=your-encryption-key
VITE_APP_NAME=PassVault
VITE_APP_VERSION=1.0.0
```

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- Custom color palette
- Extended spacing and typography
- Responsive breakpoints
- Dark mode support

## Features in Detail

### Home Page
- Hero section with compelling value proposition
- Feature highlights with interactive animations
- Testimonials and social proof
- Call-to-action sections

### Dashboard
- Security score visualization
- Password strength analytics
- Recent activity timeline
- Quick action buttons
- Breach alerts and notifications

### Password Management
- Secure password storage with encryption
- Password generation with customizable options
- Category-based organization
- Advanced search and filtering
- Bulk operations support

### Analytics
- Security score tracking
- Password strength distribution
- Usage patterns and trends
- Risk assessment reports

### Settings
- Account management
- Security preferences
- Backup and sync options
- Export and import functionality

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   ```
   Build Command: npm run build
   Output Directory: dist
   Root Directory: client
   ```

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure redirects for SPA routing

### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY client/package*.json ./
RUN npm install

COPY client/ .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
```

## Contributing

We welcome contributions! Please see our repo. for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow the existing code style
- Add JSDoc comments for functions
- Write tests for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Project Evolution

### From Python to TypeScript
This project represents a complete technological transformation:

- **Original Version**: Built with Python backend and basic frontend
- **Current Version**: Modern TypeScript/React application with enhanced features
- **Benefits of Migration**:
  - Improved performance and user experience
  - Modern, responsive UI with Tailwind CSS
  - Better developer experience with TypeScript
  - Mobile-first responsive design
  - Faster development cycles with Vite
  - Smooth animations with Framer Motion
  - Enhanced type safety and error prevention

## Acknowledgments

- **React Team** - For the amazing React framework
- **Vite Team** - For the lightning-fast build tool
- **Tailwind Labs** - For the utility-first CSS framework
- **Framer** - For the smooth animation library
- **Our Contributors** - For making this project better

---

<div align="center">
  <p>Made with dedication by the PassVault Team</p>
  <p>
    <a href="https://github.com/your-username/passvault">Star us on GitHub</a> •
    <a href="https://twitter.com/passvault">Follow on Twitter</a> •
    <a href="https://discord.gg/passvault">Join Discord</a>
  </p>
</div>
