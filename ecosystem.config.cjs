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
        CONTENT_HEALTH_TOKEN:
          process.env.CONTENT_HEALTH_TOKEN || "PASTE_CONTENT_HEALTH_TOKEN",
        OPS_HEALTH_TOKEN:
          process.env.OPS_HEALTH_TOKEN ||
          process.env.CONTENT_HEALTH_TOKEN ||
          "PASTE_CONTENT_HEALTH_TOKEN",
      },
    },
  ],
};
