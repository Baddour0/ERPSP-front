FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy static frontend files to Nginx web root
COPY . /usr/share/nginx/html/

# Update API_BASE in app.js to use relative URLs so Nginx proxies them to the backend
RUN sed -i "s|const API_BASE = 'http://localhost:5000'|const API_BASE = ''|g" /usr/share/nginx/html/js/app.js

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
