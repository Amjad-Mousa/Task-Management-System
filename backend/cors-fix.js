/**
 * Configure CORS middleware to allow credentials and specify allowed origin
 * This is essential for cross-domain requests with authentication
 */
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow both localhost and 127.0.0.1
    credentials: true, // Enable credentials
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  })
);

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(req.method + " " + req.url);
  console.log("Cookies:", req.cookies);
  next();
});
