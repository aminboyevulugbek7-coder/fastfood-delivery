# FastFood Bagat Telegram Bot

Modern order management system for an Uzbek fast-food restaurant, built with NestJS, TypeScript, and Firebase Realtime Database.

## Features

- **Telegram Bot Interface**: Customer-facing interface for browsing menu and placing orders
- **Admin Panel**: Real-time order management and menu catalog editing
- **Firebase Integration**: Real-time data synchronization across all clients
- **TypeScript Strict Mode**: Full type safety with strict compiler settings
- **Comprehensive Logging**: Winston-based structured logging
- **Global Exception Handling**: Centralized error handling with error tracking
- **Input Validation**: DTO-based validation with class-validator

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Firebase project with Realtime Database
- Telegram Bot Token

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fastfood-bagat-telegram-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_DATABASE_URL=your_firebase_database_url
ADMIN_TOKEN=your_admin_token
```

## Development

Start the development server with hot reload:
```bash
npm run start:dev
```

## Building

Build the project for production:
```bash
npm run build
```

## Running

Start the production server:
```bash
npm run start:prod
```

## Testing

Run unit tests:
```bash
npm run test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run property-based tests:
```bash
npm run test:pbt
```

Run integration tests:
```bash
npm run test:integration
```

Generate coverage report:
```bash
npm run test:cov
```

## Project Structure

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
├── config/                    # Configuration management
├── logger/                    # Winston logger setup
├── common/                    # Shared utilities, filters, interceptors
├── firebase/                  # Firebase integration
├── bot/                       # Telegram bot implementation
├── order/                     # Order management
├── food/                      # Food catalog management
├── user/                      # User management
├── auth/                      # Authentication & authorization
└── image/                     # Image upload & storage
```

## Architecture

The application follows NestJS modular architecture with:

- **Controllers**: HTTP request handling
- **Services**: Business logic
- **Repositories**: Data access layer
- **DTOs**: Data validation and transformation
- **Filters**: Global exception handling
- **Interceptors**: Request/response logging

## TypeScript Configuration

The project uses strict TypeScript configuration with:

- `strictNullChecks`: Strict null checking
- `strictFunctionTypes`: Strict function type checking
- `noImplicitAny`: Disallow implicit any types
- `noImplicitThis`: Disallow implicit this types
- `alwaysStrict`: Always use strict mode
- And more strict flags for maximum type safety

## Environment Variables

Required environment variables:

- `TELEGRAM_BOT_TOKEN`: Telegram Bot API token
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Firebase private key
- `FIREBASE_CLIENT_EMAIL`: Firebase client email
- `ADMIN_TOKEN`: Admin authentication token

Optional environment variables:

- `NODE_ENV`: Application environment (development/staging/production)
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (default: info)
- `FIREBASE_DATABASE_URL`: Firebase database URL
- `BOT_WEBHOOK_URL`: Bot webhook URL
- `ADMIN_PANEL_URL`: Admin panel URL

## Logging

Logs are written to:

- `logs/error.log`: Error logs only
- `logs/combined.log`: All logs
- Console: In development mode

Log rotation is configured for daily rotation with 30-day retention.

## Error Handling

All errors are caught by the global exception filter and return:

- HTTP 400: Validation errors
- HTTP 401: Unauthorized
- HTTP 403: Forbidden
- HTTP 404: Not found
- HTTP 500: Server errors

Each error response includes:

- `statusCode`: HTTP status code
- `message`: User-friendly error message in Uzbek
- `errorId`: Unique error ID for tracking
- `timestamp`: Error timestamp
- `path`: Request path
- `errors`: Validation errors (if applicable)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests to ensure everything passes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
