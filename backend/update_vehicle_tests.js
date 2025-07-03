import fs from 'fs';

// Read the current test file
const testFile = 'test/models/vehicle.model.test.js';
let content = fs.readFileSync(testFile, 'utf8');

// Define the fields that need to be added to vehicle test data
const fieldsToAdd = {
  'user_id: 1,': ['license_plate:', 'model:', 'type:', 'color:'],
  'property_id: 1,': ['user_id:'],
  'parkingZone_id: null,': ['property_id:'],
  'vehicle_createAt: \'2025-07-03\',': ['status_id:'],
  'vehicle_updateAt: \'2025-07-03\'': ['vehicle_createAt:']
};

// Find all VehicleModel.create calls and add missing fields
const vehicleCreateRegex = /VehicleModel\.create\(\s*{\s*([\s\S]*?)\s*}\s*\)/g;

content = content.replace(vehicleCreateRegex, (match, fields) => {
  let updatedFields = fields;
  
  // Add missing fields if they don't exist
  if (!updatedFields.includes('user_id:')) {
    updatedFields += ',\n        user_id: 1';
  }
  if (!updatedFields.includes('property_id:')) {
    updatedFields += ',\n        property_id: 1';
  }
  if (!updatedFields.includes('parkingZone_id:')) {
    updatedFields += ',\n        parkingZone_id: null';
  }
  if (!updatedFields.includes('vehicle_createAt:')) {
    updatedFields += ',\n        vehicle_createAt: \'2025-07-03\'';
  }
  if (!updatedFields.includes('vehicle_updateAt:')) {
    updatedFields += ',\n        vehicle_updateAt: \'2025-07-03\'';
  }
  
  return `VehicleModel.create({\n        ${updatedFields.trim()}\n      })`;
});

// Write the updated content back to the file
fs.writeFileSync(testFile, content, 'utf8');
console.log('Vehicle model test file updated successfully');
