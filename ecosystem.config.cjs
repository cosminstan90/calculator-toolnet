module.exports = {
  apps: [
    {
      name: "calculatoare-online",
      script: "npm",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || "3015",
      },
    },
  ],
};
