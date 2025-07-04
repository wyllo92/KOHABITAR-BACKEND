import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { TestHelper } from './helpers/testHelper.js';

// Import all test suites
import './controllers/user.controller.test.js';
import './controllers/amenity.controller.test.js';
import './controllers/vehicle.controller.test.js';

import './models/user.model.test.js';
import './models/amenity.model.test.js';
import './models/vehicle.model.test.js';

describe('All Tests Suite', () => {
  before(async function() {
    this.timeout(30000);
    console.log('Setting up test environment...');
    await TestHelper.resetDatabase();
  });

  after(async function() {
    this.timeout(30000);
    console.log('Cleaning up test environment...');
    await TestHelper.clearDatabase();
  });

  it('should have all test suites loaded', () => {
    expect(true).to.be.true;
  });
});
