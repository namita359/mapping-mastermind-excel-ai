
# Import all functions from the refactored modules to maintain backward compatibility
from .connection import get_db_connection
from .mapping_operations import (
    save_mapping_file_to_single_table,
    load_mapping_files_from_single_table,
    update_mapping_row_status_single_table,
    add_mapping_row_comment_single_table
)
from .metadata_operations import (
    search_metadata_single_table,
    get_all_malcodes_single_table,
    get_tables_by_malcode_single_table,
    get_columns_by_table_single_table,
    create_malcode_metadata_single_table,
    create_table_metadata_single_table,
    create_column_metadata_single_table
)

# Export all functions for backward compatibility
__all__ = [
    'get_db_connection',
    'save_mapping_file_to_single_table',
    'load_mapping_files_from_single_table',
    'update_mapping_row_status_single_table',
    'add_mapping_row_comment_single_table',
    'search_metadata_single_table',
    'get_all_malcodes_single_table',
    'get_tables_by_malcode_single_table',
    'get_columns_by_table_single_table',
    'create_malcode_metadata_single_table',
    'create_table_metadata_single_table',
    'create_column_metadata_single_table'
]
