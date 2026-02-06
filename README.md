# 🧊 PocketFridge

A modern web application to manage your fridge inventory - always know what's in your fridge!

**TartanHacks 2026** - kai, sean, arielle, barbara

## 🚀 Features

- 📱 Multiple fridge management
- 🥑 Track food items with expiry dates
- ⚡ Get alerts for expiring items
- 🏷️ Organize by categories
- 📝 Add notes to items
- 🎨 Clean, responsive UI

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Ready for**: Bun/Elysia migration

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/9hrsleep/pocketfridge.git
cd pocketfridge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` if you need to change the default configuration.

### 4. Initialize the database

```bash
npm run db:setup
```

### 5. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
pocketfridge/
├── src/
│   ├── index.js                 # Main server file
│   ├── routes/                  # API route handlers
│   │   ├── fridge.js           # Fridge endpoints
│   │   └── items.js            # Item endpoints
│   ├── database/               # Database configuration
│   │   ├── db.js              # Database connection & schema
│   │   └── setup.js           # Database initialization script
│   ├── controllers/           # Business logic (future)
│   ├── models/                # Data models (future)
│   ├── middleware/            # Custom middleware (future)
│   └── utils/                 # Utility functions (future)
├── public/                     # Frontend files
│   ├── index.html             # Main HTML file
│   ├── css/
│   │   └── style.css          # Styles
│   ├── js/
│   │   └── app.js             # Frontend JavaScript
│   └── images/                # Static images
├── data/                       # SQLite database (gitignored)
├── .env.example               # Environment template
├── .eslintrc.json            # ESLint configuration
├── .prettierrc               # Prettier configuration
└── package.json              # Dependencies and scripts
```

## 🔌 API Endpoints

### Fridges

- `GET /api/fridges` - Get all fridges
- `GET /api/fridges/:id` - Get a specific fridge
- `POST /api/fridges` - Create a new fridge
- `PUT /api/fridges/:id` - Update a fridge
- `DELETE /api/fridges/:id` - Delete a fridge
- `GET /api/fridges/:id/items` - Get all items in a fridge

### Items

- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get a specific item
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item
- `GET /api/items/expiring/:days` - Get items expiring within N days

### Health Check

- `GET /api/health` - Check API status

## 🧪 Development

### Run linter

```bash
npm run lint
```

### Format code

```bash
npm run format
```

### Run tests (when implemented)

```bash
npm test
```

## 🤝 Collaboration Guidelines

### Branch Naming Convention

- `feature/your-feature-name` - For new features
- `fix/bug-description` - For bug fixes
- `docs/description` - For documentation updates
- `refactor/description` - For code refactoring

### Commit Message Convention

Follow conventional commits:

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `style: format code`
- `refactor: improve code structure`
- `test: add tests`

### Code Style

- Use ESLint and Prettier configurations provided
- Run `npm run format` before committing
- Keep functions small and focused
- Add comments for complex logic
- Follow REST API conventions

### Pull Request Process

1. Create a new branch from `main`
2. Make your changes
3. Run linter and tests
4. Format your code
5. Submit a pull request with a clear description
6. Request review from team members

## 🗺️ Roadmap

- [ ] User authentication
- [ ] Barcode scanning for items
- [ ] Nutrition information integration
- [ ] Shopping list generation
- [ ] Recipe suggestions based on available items
- [ ] Mobile app version
- [ ] Multi-user support
- [ ] Data export/import
- [ ] Notifications for expiring items

## 📝 License

MIT

## 👥 Team

- **Kai** - Developer
- **Sean** - Developer
- **Arielle** - Developer
- **Barbara** - Developer

---

Made with ❤️ at TartanHacks 2026
