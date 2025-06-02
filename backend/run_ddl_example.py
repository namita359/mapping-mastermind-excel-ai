
#!/usr/bin/env python3
"""
Example script showing how to run DDL operations programmatically
"""

import asyncio
import json
from table_operations import create_tables, drop_tables, verify_tables, create_single_mapping_table, create_single_metadata_table
from ddl_manager import execute_custom_sql

async def main():
    """Main function to demonstrate DDL operations"""
    
    print("=== Azure SQL DDL Operations Demo (Single Table Structure) ===\n")
    
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
        
        # 3. Create single mapping table
        print("3. Creating single mapping table...")
        create_mapping_results = create_single_mapping_table()
        print("Create mapping table results:")
        for result in create_mapping_results:
            print(f"  {result.get('message', result)}")
        print()
        
        # 4. Create single metadata table
        print("4. Creating single metadata table...")
        create_metadata_results = create_single_metadata_table()
        print("Create metadata table results:")
        for result in create_metadata_results:
            print(f"  {result.get('message', result)}")
        print()
        
        # 5. Verify tables were created
        print("5. Verifying tables were created...")
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
        
        # 6. Example of custom SQL with single table
        print("6. Running custom SQL example on single table...")
        custom_sql = """
        INSERT INTO mapping_single (
            mapping_file_name, mapping_file_description, source_system, target_system,
            source_malcode, source_table_name, source_column_name, source_data_type,
            target_malcode, target_table_name, target_column_name, target_data_type,
            transformation, created_by
        ) VALUES (
            'Test Mapping Single', 'Test description for single table', 'Source_System', 'Target_System',
            'TEST', 'TEST_TABLE', 'TEST_COLUMN', 'string',
            'TGT', 'TGT_TABLE', 'TGT_COLUMN', 'string',
            'DIRECT', 'admin'
        );
        
        SELECT COUNT(*) as mapping_count FROM mapping_single;
        """
        custom_results = execute_custom_sql(custom_sql)
        print("Custom SQL results:")
        for result in custom_results:
            if result["type"] == "select":
                print(f"  Query result: {result['rows']}")
            else:
                print(f"  {result.get('message', result)}")
        print()
        
        print("=== DDL Operations completed successfully with single table structure! ===")
        
    except Exception as e:
        print(f"Error during DDL operations: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
