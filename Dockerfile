# Use an official Node.js runtime as the base image
FROM node:current

# Set the working directory in the container
WORKDIR /Users/polina/heatmapproj/heatmap-api

# Copy the package.json and package-lock.json to install dependencies
COPY heatmap-api/package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of your app's code to the working directory
COPY heatmap-api .

# Expose the port on which your app will run
EXPOSE 4000

# Command to run the application
CMD ["node", "server.js"]
