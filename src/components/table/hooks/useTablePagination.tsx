
import { useState } from "react";

export const useTablePagination = (rowsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const resetPagination = () => {
    setCurrentPage(1);
  };

  const paginateRows = <T,>(rows: T[]): {
    paginatedRows: T[];
    totalPages: number;
    startIndex: number;
    endIndex: number;
    totalRows: number;
  } => {
    const totalRows = rows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const paginatedRows = rows.slice(startIndex, endIndex);

    return {
      paginatedRows,
      totalPages,
      startIndex,
      endIndex,
      totalRows
    };
  };

  const getPageNumbers = (totalPages: number) => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        endPage = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      if (startPage > 2) {
        pages.push(-1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pages.push(-2);
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return {
    currentPage,
    setCurrentPage,
    resetPagination,
    paginateRows,
    getPageNumbers
  };
};
