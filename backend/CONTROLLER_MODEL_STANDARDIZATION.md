# KOHABITAR Backend - Controller and Model Standardization

## Overview
This document describes the comprehensive standardization of all controllers and models in the KOHABITAR backend system, following the patterns established in the `user.controller.js`.

## Standardized Pattern Implemented

### Controller Pattern
Each controller follows this standardized structure with these methods:

1. **register(req, res)** - Create new entity
2. **show(req, res)** - Get all active entities
3. **update(req, res)** - Update existing entity
4. **delete(req, res)** - Delete entity
5. **findById(req, res)** - Find entity by ID (active only)

### Model Pattern
Each model follows this standardized structure with these methods:

1. **create(data)** - Insert new record
2. **show()** - Get all records
3. **showActive()** - Get all active records (status_id = 1)
4. **update(id, data)** - Update existing record
5. **delete(id)** - Delete record
6. **findById(id)** - Find record by ID
7. **findByIdActive(id)** - Find active record by ID

### Error Handling Pattern
All controllers implement consistent error handling:
- **400** - Missing required fields
- **409** - Entity doesn't exist or conflict
- **500** - Internal server error
- **201** - Success with data
- **200** - Success (for login)

## Controllers and Models Updated

### ✅ Completed Updates
1. **User Controller/Model** - ✅ (Original pattern source)
2. **Amenity Controller/Model** - ✅ (Fully updated with tests)
3. **Role Controller/Model** - ✅ (Updated with standard pattern)
4. **Vehicle Controller/Model** - ✅ (Fully updated with tests)

### 🔄 Controllers to be Updated
1. **Visitor Controller/Model**
2. **Property Controller/Model**
3. **Reservation Controller/Model**
4. **Payment Controller/Model**
5. **Invoice Controller/Model**
6. **ParkingSlot Controller/Model**
7. **ParkingZone Controller/Model**
8. **Status Controller/Model**
9. **DocumentType Controller/Model**
10. **Profile Controller/Model**
11. **Notification Controller/Model**
12. **Module Controller/Model**
13. **UserRole Controller/Model**
14. **UserStatus Controller/Model**
15. **Salary Controller/Model**
16. **Token Controller/Model**
17. **UploadFile Controller/Model**
18. **TestMysql Controller/Model**

## Testing Framework

### Test Structure
- **Unit Tests** for all controllers and models
- **Integration Tests** using test database
- **Mock Objects** for request/response testing
- **Test Helpers** for database setup/cleanup

### Test Files Created
1. `test/helpers/testHelper.js` - Database utilities and mocks
2. `test/controllers/user.controller.test.js` - User controller tests
3. `test/controllers/amenity.controller.test.js` - Amenity controller tests  
4. `test/controllers/vehicle.controller.test.js` - Vehicle controller tests
5. `test/models/user.model.test.js` - User model tests
6. `test/models/amenity.model.test.js` - Amenity model tests
7. `test/models/vehicle.model.test.js` - Vehicle model tests
8. `test/index.test.js` - Test runner

### Test Commands
```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
```

## Database Schema Requirements

### Standard Fields
All entities should have:
- **Primary Key**: `{entity}_id`
- **Status Field**: `status_id` (1 = Active, 2 = Inactive)
- **Created/Updated**: Timestamp fields for auditing

### Status Reference Table
```sql
CREATE TABLE status (
  status_id INT PRIMARY KEY,
  status_name VARCHAR(50)
);

INSERT INTO status VALUES 
  (1, 'Active'), 
  (2, 'Inactive');
```

## Implementation Guidelines

### For Controllers:
1. Import model with correct naming convention
2. Implement all 5 standard methods
3. Use consistent error messages
4. Validate required fields
5. Check entity existence before operations
6. Return consistent response format

### For Models:
1. Use proper table and column naming
2. Implement all 7 standard methods
3. Include proper JOIN queries for related data
4. Handle errors with try/catch
5. Return appropriate data types

### For Tests:
1. Use `beforeEach` and `afterEach` for database cleanup
2. Test all CRUD operations
3. Test error scenarios
4. Use mock objects for request/response
5. Assert on status codes and response structure

## Next Steps

1. **Complete Remaining Controllers** - Apply standardized pattern to all remaining controllers
2. **Complete Remaining Models** - Add missing methods to all models
3. **Create Remaining Tests** - Generate comprehensive test suites for all entities
4. **Database Validation** - Ensure all tables follow standard schema
5. **API Documentation** - Update documentation to reflect standardized endpoints
6. **Integration Testing** - Add end-to-end testing with actual HTTP requests
7. **Performance Testing** - Add load testing for database operations

## Benefits of Standardization

1. **Consistency** - All endpoints follow the same pattern
2. **Maintainability** - Easier to understand and modify code
3. **Testing** - Comprehensive test coverage for all operations
4. **Error Handling** - Predictable error responses
5. **Documentation** - Clear API structure for frontend developers
6. **Scalability** - Easy to add new entities following the same pattern

## Files Modified

### Package Configuration
- `package.json` - Added testing dependencies and scripts

### Controllers Updated
- `controllers/amenity.controller.js`
- `controllers/role.controller.js`
- `controllers/vehicle.controller.js`

### Models Updated
- `models/amenity.model.js`
- `models/role.model.js`
- `models/vehicle.model.js`

### Test Files Created
- All test files in `test/` directory
- Test helper utilities
- Mock factories

### Utility Scripts
- `scripts/generateEntities.js` - Template generator for rapid development

## Running the System

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Start Server**:
   ```bash
   npm start
   ```

4. **Run Database Migration**:
   ```bash
   npm run migrate
   ```

This standardization provides a solid foundation for a scalable, maintainable backend system with comprehensive testing coverage.
