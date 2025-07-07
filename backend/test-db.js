import { connect } from './config/db/connectMysql.js';

async function testDatabase() {
    try {
        console.log('Testing database connection...');
        
        // Test basic connection
        const [result] = await connect.query('SELECT 1 as test');
        console.log('Database connection successful:', result);
        
        // Check if report table exists
        const [tables] = await connect.query("SHOW TABLES LIKE 'report'");
        console.log('Report table exists:', tables.length > 0);
        
        if (tables.length > 0) {
            // Check table structure
            const [columns] = await connect.query("DESCRIBE report");
            console.log('Report table structure:');
            columns.forEach(col => {
                console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
            });
        }
        
        // Test a simple insert with minimal data
        const testData = {
            User_id: 1,
            Report_title: 'Test Report',
            Report_description: 'Test Description',
            report_type_id: 1,
            Status_id: 1,
            Report_file_url: null,
            Report_created_at: '2025-07-06T10:00:00.000Z'
        };
        
        console.log('\nTesting insert with:', testData);
        
        const insertQuery = "INSERT INTO report (User_id, Report_title, Report_description, report_type_id, Status_id, Report_file_url, Report_created_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const [insertResult] = await connect.query(insertQuery, [
            testData.User_id,
            testData.Report_title,
            testData.Report_description,
            testData.report_type_id,
            testData.Status_id,
            testData.Report_file_url,
            testData.Report_created_at
        ]);
        
        console.log('Insert successful:', insertResult);
        
    } catch (error) {
        console.error('Database test failed:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('SQL State:', error.sqlState);
    }
}

testDatabase();
