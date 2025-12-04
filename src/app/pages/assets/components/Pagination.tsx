import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function AssetPagination({ pagination, currentPage, setCurrentPage, totalAssets }: any) {
  if (!pagination.count) return null;

  return (
    <div className="pagination-wrap">
      <div className="flex flex-col gap-2">
        <p>
          Showing From {pagination.from} to {pagination.to} of {totalAssets}
        </p>

        <div className="flex items-center gap-2">
          <p>Go to Page</p>
          <select
            className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1"
            onChange={(e) => setCurrentPage(Number(e.target.value))}
          >
            {[...Array(pagination.count).keys()].map((int) => (
              <option key={int} value={int + 1}>
                {int + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="listjs-pagination">
        {currentPage > 1 && (
          <>
            <li>
              <button onClick={() => setCurrentPage(1)} className="page">
                <ChevronsLeft className="size-4" />
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage(currentPage - 1)} className="page">
                <ChevronLeft className="size-4" />
              </button>
            </li>
          </>
        )}

        {[...Array(pagination.count).keys()].map((int) => (
          int + 1 >= currentPage - 1 && int + 1 <= currentPage + 1 && (
            <li key={int} className={currentPage === int + 1 ? "active" : ""}>
              <button onClick={() => setCurrentPage(int + 1)} className="page">
                {int + 1}
              </button>
            </li>
          )
        ))}

        {currentPage < pagination.count && (
          <>
            <li>
              <button onClick={() => setCurrentPage(currentPage + 1)} className="page">
                <ChevronRight className="size-4" />
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentPage(pagination.count)} className="page">
                <ChevronsRight className="size-4" />
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
