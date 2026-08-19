{
  "functions": {
    "api/*": {
      "runtime": "nodejs22.x",
      "entry": "api/index.js"
    }
  },
  "routes": [
    {
      "src": "/api/translate",
      "dest": "/api/index.js"
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}