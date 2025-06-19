const App = require("../app");

// Create a test app instance
const app = new App();

// Export the Express app for testing
module.exports = app.getApp();
