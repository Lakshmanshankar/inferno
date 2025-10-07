## Inferno
Inferno Editor is a custom rich-text editor built with [Lexical](https://lexical.dev/). It provides a modern, Notion-like editing experience with a variety of formatting options, slash commands, and a customizable interface.

## Features

- **Rich Text Editing**: Provides a wide range of text formatting options, including bold, italic, underline, strikethrough, and code blocks.
- **Markdown Support**: Write in Markdown and have it automatically converted to rich text.
- **Slash Commands**: Use the `/` key to quickly access and insert different types of content.
- **Link Editing**: Easily insert and edit hyperlinks with a floating toolbar.
- **Customizable Theme**: The editor's appearance can be customized through the settings panel.
- **Persistence**: Editor content is automatically saved to IndexedDB, ensuring no data is lost.
- **Responsive Design**: The editor is designed to work seamlessly on both desktop and mobile devices.

## Tech Stack

- **Framework**: [React](https://react.dev/)
- **Editor**: [Lexical](https://lexical.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Testing**: [Playwright](https://playwright.dev/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [pnpm](https://pnpm.io/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Lakshmanshankar/cms-editor.git
    cd cms-editor
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

### Running the Development Server

To start the development server, run the following command:

```bash
pnpm dev
```

This will start the application on `http://localhost:3000`.

## Available Scripts

| Script                 | Description                                 |
| ---------------------- | ------------------------------------------- |
| `pnpm dev`             | Starts the development server.              |
| `pnpm build`           | Builds the application for production.      |
| `pnpm lint`            | Lints the codebase using ESLint.            |
| `pnpm preview`         | Previews the production build locally.      |
| `pnpm test:e2e`        | Runs the end-to-end tests using Playwright. |
| `pnpm test:e2e:report` | Shows the Playwright test report.           |
| `pnpm test:e2e:head`   | Runs the end-to-end tests in headed mode.   |

## Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. To run the tests, use the following command:

```bash
pnpm test:e2e
```

After the tests have run, you can view a detailed report with this command:
