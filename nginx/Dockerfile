FROM nginx:1.29-alpine@sha256:5616878291a2eed594aee8db4dade5878cf7edcb475e59193904b198d9b830de

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directories for SSL and certbot
RUN mkdir -p /etc/nginx/ssl /var/www/certbot

# Create a simple health check page
RUN echo "healthy" > /usr/share/nginx/html/health.html

# Forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

