# Use the official SQLite image as the base image
FROM nouchka/sqlite:latest

# Set the working directory inside the container
WORKDIR /data

# Expose the default SQLite port
EXPOSE 8080

# Run SQLite without a command so it doesn't exit
CMD ["sqlite3"]