# Careers Form Application

## Overview

The `careers-form` application is a Node.js-based project that runs an Express.js server locally and is deployed on Netlify for production.

## Local Development

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)

### Installation

Clone the repository and install dependencies:

```sh
# Clone the repository
git clone <repository-url>
cd careers-form

# Install dependencies
npm install
```

### Running the Application Locally

To start the local server, use:

```sh
npm start
```

This runs `server.js` using Node.js, which starts the Express server. The local API requests are handled via `server.js` using Express.js. This setup is only for local development. In production, API requests are handled by the Netlify `functions` folder.

## Project Structure

The project contains the following folders:

### `public` Folder

Contains frontend files:

- `index.html` - The main HTML file for the form.
- `form.js` - JavaScript file handling form interactions.
- `styles.css` - CSS file for styling the form.

### `functions` Folder

Contains serverless functions for handling API requests securely on Netlify. The API requests interact with the Google Sheets API and act as middleware to prevent exposing API keys directly in the frontend. This is used only in the production environment on Netlify.

## Netlify Deployment

### Connecting to Netlify

To deploy the application on Netlify, follow these steps:

1. Install the Netlify CLI globally if not already installed:

   ```sh
   npm install -g netlify-cli
   ```

2. Log in to Netlify:

   ```sh
   netlify login
   ```

3. Initialize the project with Netlify:

   ```sh
   netlify init
   ```

   Follow the prompts to link the project to a new or existing Netlify site.

### Deploying to Netlify

To deploy your application, use the following commands:

#### Deploy to Production

```sh
netlify deploy --prod --dir=public --functions=functions
```

This will deploy the `public` directory and the `functions` folder as Netlify functions in production.

#### Deploy to a Draft URL (Preview Build)

```sh
netlify deploy --dir=public --functions=functions
```

This deploys the app to a draft URL that can be reviewed before going live.

## Environment Variables

API keys and other sensitive information are stored in environment variables. These are managed differently for local development and Netlify:

- **Local Development:** Create a `.env` file in the root directory and add the required environment variables there.
- **Netlify Deployment:** Use the `netlify.toml` file or the Netlify environment settings to securely store API keys and configurations.

### Example `.env` file (local development)

```sh
GOOGLE_SHEETS_API_KEY=your_api_key_here
```

### Example `netlify.toml` file (Netlify deployment)

```toml
[build]
  functions = "functions"
  publish = "public"

[context.production.environment]
  GOOGLE_SHEETS_API_KEY = "your_api_key_here"
```

To set environment variables on Netlify via CLI, run:

```sh
netlify env:set VARIABLE_NAME value
```

## Additional Resources

- [Netlify CLI Documentation](https://docs.netlify.com/cli/get-started/)
- [Express.js Documentation](https://expressjs.com/)
