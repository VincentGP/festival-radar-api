const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  // Hent vores variabler
  let config = require('./config.json');
  // Gem kun variablerne (som kommer fra det 'env' vi er i)
  let envConfig = config[env];
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}