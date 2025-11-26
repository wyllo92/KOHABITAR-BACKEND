// migrate.js
import { runMigration } from './migration_conjunto_residencial.js';

console.log("Ejecutando migración...");

runMigration()
  .then((result) => {
    if (result.success) {
      console.log('Migración completa');
      process.exit(0);
    } else {
      console.error('La migración falló: ', result.error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("La migración no se completó: ", error);
    process.exit(1);
  });