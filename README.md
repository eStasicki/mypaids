# MyPaids

A modern web application for managing household bills and expenses, built with SvelteKit.

## Features

- 📊 **Bill Management**: Add, edit, and organize your monthly bills
- 📅 **Monthly Tracking**: Track expenses by month with detailed breakdowns
- 🏷️ **Categories**: Organize bills by categories (electricity, water, gas, internet, etc.)
- 📈 **Statistics & Charts**: Visualize your spending with interactive charts and statistics
- 📄 **Export/Import**: Export data to JSON, CSV, or PDF formats
- 📋 **Templates**: Create bill templates for recurring expenses
- 🔍 **Search & Filter**: Find bills quickly with advanced search and filtering options
- 🌐 **Internationalization**: Full i18n support (currently Polish)

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) with Svelte 5
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Chart.js](https://www.chartjs.org/)
- **PDF Generation**: [pdfMake](https://pdfmake.github.io/docs/)
- **Internationalization**: [svelte-i18n](https://github.com/kaisermann/svelte-i18n)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mypaids
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:4200](http://localhost:4200) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── lib/
│   ├── components/       # Svelte components
│   ├── i18n/            # Internationalization files
│   │   └── pl-PL.json   # Polish translations
│   ├── stores/          # Svelte stores
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
│       ├── categoryUtils.ts
│       ├── exportUtils.ts
│       ├── monthUtils.ts
│       ├── pdfUtils.ts
│       └── ...
├── routes/
│   ├── +page.svelte     # Main page
│   └── summary/
│       └── +page.svelte # Statistics page
└── hooks.client.ts      # Client-side hooks
```

## Internationalization

The application uses `svelte-i18n` for internationalization. All translations are stored in `src/lib/i18n/pl-PL.json`.

To add a new language:
1. Create a new translation file (e.g., `en-US.json`)
2. Register it in `src/lib/i18n/index.ts`
3. Update the locale configuration

## Code Formatting

The project uses Prettier for code formatting. Configuration is in `.prettierrc`.

- Uses tabs for indentation
- 100 character line width
- Double quotes for strings
- Trailing commas (ES5)

Format all files:
```bash
npm run format
```

## Data Storage

All data is stored locally in the browser using `localStorage`. No backend or database is required.

## Export Formats

- **JSON**: Structured data format for backup/restore
- **CSV**: Spreadsheet-compatible format
- **PDF**: Professional reports for printing

## License

This project is private and proprietary.
