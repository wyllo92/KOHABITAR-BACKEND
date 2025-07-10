import { connect } from '../config/db/connectMysql.js';

async function addStatusToProperty() {
  try {
    console.log('Iniciando migración: Agregando status_id a la tabla property...');
    
    // Agregar la columna status_id a la tabla property
    const alterQuery = `
      ALTER TABLE property 
      ADD COLUMN status_id INT(11) DEFAULT 1,
      ADD CONSTRAINT fk_property_status 
      FOREIGN KEY (status_id) REFERENCES status(status_id)
    `;
    
    await connect.query(alterQuery);
    console.log('✅ Columna status_id agregada exitosamente a la tabla property');
    
    // Actualizar las propiedades existentes para que tengan un status_id válido
    const updateQuery = `
      UPDATE property 
      SET status_id = 1 
      WHERE status_id IS NULL OR status_id = 0
    `;
    
    await connect.query(updateQuery);
    console.log('✅ Propiedades existentes actualizadas con status_id = 1');
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

// Ejecutar la migración si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addStatusToProperty()
    .then(() => {
      console.log('Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en migración:', error);
      process.exit(1);
    });
}

export default addStatusToProperty; 