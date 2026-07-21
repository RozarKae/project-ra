import React from 'react';

export interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-[#D4AF37]/10 bg-[#141414]/20 ${className}`}>
      <table className="w-full text-left border-collapse text-xs font-poppins">
        <thead>
          <tr className="border-b border-[#D4AF37]/10 bg-[#090909]/40 text-[#D4AF37] uppercase tracking-wider text-[10px] font-semibold">
            {headers.map((h, i) => (
              <th key={i} className="p-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D4AF37]/5 text-[#F5F5F5]/85">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
