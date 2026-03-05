// src/index.ts - Entry point
import app from './app';
import { envs } from './config/envs';

const PORT = envs.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 