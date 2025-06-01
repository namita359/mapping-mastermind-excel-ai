
#!/usr/bin/env python3
"""
Example script showing how to run DDL operations programmatically
"""

import asyncio
import json
from table_operations import create_tables, drop_tables, verify_tables
from ddl_manager import execute_custom_sql

async def main():
    """Main function to demonstrate DDL operations"""
    
    print("=== Azure SQL DDL Operations Demo ===\n")
    
    try:
        # 1. Verify current state
        print("1. Verifying current database state...")
        verify_results = verify_tables()
        print("Verification results:")
        for result in verify_results:
            if result["type"] == "select":
                print(f"  Query returned {len(result['rows'])} rows")
                for row in result["rows"]:
                    print(f"    {row}")
            else:
                print(f"  {result.get('message', result)}")
        print()
        
        # 2. Drop existing tables (if any)
        print("2. Dropping existing tables...")
        drop_results = drop_tables()
        print("Drop results:")
        for result in drop_results:
            print(f"  {result.get('message', result)}")
        print()
        
        # 3. Create tables
        print("3. Creating new tables...")
        create_results = create_tables()
        print("Create results:")
        for result in create_results:
            print(f"  {result.get('message', result)}")
        print()
        
        # 4. Verify tables were created
        print("4. Verifying tables were created...")
        verify_results = verify_tables()
        print("Final verification results:")
        for result in verify_results:
            if result["type"] == "select":
                print(f"  Query returned {len(result['rows'])} rows")
                for row in result["rows"]:
                    print(f"    {row}")
            else:
                print(f"  {result.get('message', result)}")
        print()
        
        # 5. Example of custom SQL
        print("5. Running custom SQL example...")
        custom_sql = """
        INSERT INTO mapping_files (name, description, source_system, target_system, created_by)
        VALUES ('Test Mapping', 'Test description', 'Source_System', 'Target_System', 'admin');
        
        SELECT COUNT(*) as file_count FROM mapping_files;
        """
        custom_results = execute_custom_sql(custom_sql)
        print("Custom SQL results:")
        for result in custom_results:
            if result["type"] == "select":
                print(f"  Query result: {result['rows']}")
            else:
                print(f"  {result.get('message', result)}")
        print()
        
        print("=== DDL Operations completed successfully! ===")
        
    except Exception as e:
        print(f"Error during DDL operations: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
