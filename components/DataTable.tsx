import React from 'react';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title: string;
  actionButton?: React.ReactNode;
  getKey: (row: T) => string | number;
}

const DataTable = <T extends object>({ columns, data, title, actionButton, getKey }: DataTableProps<T>) => {
  return (
    <div className="bg-card-bg rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {actionButton}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={getKey(row)} className="hover:bg-gray-50">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={columns.length} className="text-center py-4 text-text-secondary">No data available</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;