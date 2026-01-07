# Redflare
This web app is focused to avatar artists, a replacement for kanban-board apps like Trello and Notion. Redflare is a commission organizer web app that includes dashboard for artists and customers, billing and attachment organization.

## Why Redflare?
Many note-taking applications charges to the final user for general usage, those apps are customizable for artists but with a lot of options that doesn't follow a proper standard, giving to the artist the freedom but at the same time the decision of what "format/style" to use when organizing their commissions. This is why I made Redflare, to create a standard to organize stuff for avatar artists, you can find it as a "template" for artists if you want, with billing features and storage management.

## Features & planned ideas
- Management for billing and asset storage (`.unitypackage`, `.spp`, etc.).
- Audit logs for artists.
- Role management with Auth0: **Artist** and **Manager**.
- Separated sessions for artists (Agent User) and customers (Public User).
- Simple and practical user interface for artists and customers.
  - UI isn't customizable in-app.

## Deployment and stack required
Redflare uses many services to work, it will depend on a **MongoDB** database (MongoDB Atlas cloud solution works fine), a **Auth0 tenant** for artist authentication, a **Discord OAuth App** for customer authentication, and a **Google Cloud Platform Bucket** for file storage. Additional "native" plugins you will find are **PayPal** for global payments and **Mercado Pago** for Argentina payments. You'll have to make local SSL certificates for local development, `mkcert` command can help you with that. I recommend **Bun** for package management for this project.
- Clone and `cd` into the project root folder.
- Make sure to copy the `.env.example` file, paste and rename it to `.env`. You'll have to fill every field to make the app work properly.
- **For testing**, same step but for `.env.test.example`.
- **For Windows users**, I strongly recommend to use **WSL** for the local environment.
1. Install the dependencies with `bun i`.
2. Create your SSL certificates inside the root directory with `mkcert`.
3. Setup the following services, don't forget to fill `.env` with your API keys!
    - Set up the database for the app, a MongoDB Atlas cloud instance should work.
    - Set up the Auth0 tenant for the artist authentication.
    - Create a Discord developer app for the customer authentication.
    - Create a Google Cloud Platform project. You'll have to setup a billing for it and export the IAM credentials in a JSON, then encode that JSON to Base64.
    - For global payments, set up a **PayPal** developer app.
    - For Argentina payments, set up a **MercadoPago** developer app.
4. Deploy the local development with `bun devs`.
    - In case you want to run the local server without SSL, just run `bun dev` but isn't recommended since you're interacting with external services that enforces SSL connections.
5. Since you're using GCP for development, you can use Cloud Run to deploy the app!
6. In case you want to do E2E testing, make sure to install Playwright in your environment. You can run the tests with `bun test:e2e`. For snapshot preview, use the `--ui` flag.
# License
GPL-3.0 © 2025 Xaeky - https://ko-fi.com/xaeky
