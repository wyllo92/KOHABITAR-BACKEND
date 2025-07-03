import { runMigration } from './migration_conjunto_residencial.js';

runMigration()
  .then((result) => {
    if (result.success) {
      console.log('Migración de conjunto_residencial completada exitosamente');
      process.exit(0);
    } else {
      console.error('Migración fallida:', result.error);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Error no controlado en la migración:', error);
    process.exit(1);
  }); 