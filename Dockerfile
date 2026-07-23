# https://nuxtjs.org/deployments/google-cloud-run/
# https://nuxt.com/docs/getting-started/deployment#nodejs-server
# Build app
FROM oven/bun:latest AS builder

WORKDIR /usr/src/app

# Everything must be copied, not just the package.json
# Otherwise we get errors caused by the postinstall script
COPY . ./

# Install dependencies
RUN apt-get update && apt-get install -y unzip curl
RUN bun i

ARG VERSION
ENV VERSION=${VERSION}
ARG SOURCE
ENV SOURCE=${SOURCE}
ARG REVISION
ENV REVISION=${REVISION}

RUN bun run build

# Run entrypoint
FROM oven/bun:latest

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/.output ./.output

ENV HOST=0.0.0.0
ENV PORT=8080

COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

EXPOSE ${PORT}

CMD ["/usr/src/app/entrypoint.sh"]
