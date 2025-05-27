
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalRows: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  getPageNumbers: (totalPages: number) => number[];
}

const TablePagination = ({ 
  currentPage, 
  totalPages, 
  startIndex, 
  endIndex, 
  totalRows, 
  rowsPerPage, 
  onPageChange, 
  getPageNumbers 
}: TablePaginationProps) => {
  if (totalRows <= rowsPerPage) return null;

  return (
    <div className="mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {getPageNumbers(totalPages).map((page, i) => (
            <PaginationItem key={i}>
              {page === -1 || page === -2 ? (
                <span className="flex h-9 w-9 items-center justify-center">...</span>
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      <div className="text-sm text-center text-muted-foreground mt-2">
        Showing {startIndex + 1} to {endIndex} of {totalRows} entries
      </div>
    </div>
  );
};

export default TablePagination;
