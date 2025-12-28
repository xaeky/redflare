# Contributing to Redflare

Thank you for your interest in contributing! Redflare is a webapp for managing art commissions. Our tech stack includes Nuxt 3, TypeScript, Tailwind CSS, MongoDB, Docker, and we use Google Cloud Platform for deployment.

Keep on mind, we'll only accept pull requests that align with our project's goals and maintain code quality. To ensure your work won't be rejected, we suggest using GitHub issues to discuss significant changes before you start coding.

## How to Contribute

1. **Fork the repository** and create your branch from `main`.
2. **Clone your fork** and set up the project:
    ```sh
    git clone https://github.com/<your-username>/redflare.git
    cd redflare
    ```
3. **Create a new branch** for your feature or fix:
    ```sh
    git checkout -b my-feature
    ```
4. **Setup your environemt propertly**, be sure to duplicate the `.env.example` file to `.env` and fill in the required variables. We recommend using a local MongoDB instance for development, use docker if needed. For package management, we use bun.
    ```sh
    bun install
    ```
5. **Make your changes** in accordance with the project's coding standards.
6. **Commit your changes** with a clear message, be sure to follow conventional commit guidelines:
    ```sh
    git commit -m "feat: add feature X"
    ```
7. **Push to your fork** and open a Pull Request against the `main` branch.

## Commit Message Guidelines

- Use the format: `<type>(<scope>): <description>`
- Types include:
  - feat: A new feature
  - type: Changes that affect typescript types
  - fix: A bug fix
  - docs: Documentation changes
  - style: Code style changes (formatting, missing semi-colons, etc.)
  - refactor: Code changes that neither fix a bug nor add a feature
  - test: Adding or updating tests
  - chore: Changes to the build process or auxiliary tools
  - framework: Changes related to the Nuxt framework
  - repo: Repository maintenance tasks
- Scope is optional but recommended to specify the area of the code affected, common scopes include `auth`, `api`, `ui`, etc.
- Example: `feat(auth): add login functionality`

## Pull Request Guidelines

- Describe your changes clearly, sometimes we make exceptions for small changes.
- Reference any related issues, if applicable.
- Ensure your branch is up to date with `main`.

## Reporting Issues

Use [GitHub Issues](https://github.com/xaeky/redflare/issues) for bugs and feature requests. If you are going to create a new issue, be sure to include steps to reproduce the problem or describe the feature in detail, provide screenshots if applicable, and specify your environment (OS, browser, etc.).