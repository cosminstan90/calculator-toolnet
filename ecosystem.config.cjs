module.exports = {
  apps: [
    {
      name: "calculatoare-online",
      script: ".next/standalone/server.js",
      interpreter: "node",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || "3015",
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
