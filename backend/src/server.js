const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`Serveur démarré sur le port ${env.port}`);
});