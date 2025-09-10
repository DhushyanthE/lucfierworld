
import React from "react";

interface ROIData {
  year: string;
  price: number;
  marketCap: string;
  roi: string;
}

interface ROITableProps {
  data: ROIData[];
}

export const ROITable: React.FC<ROITableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <h4 className="text-lg font-medium text-purple-400 mb-4">Return on Investment (7-Year Projection)</h4>
      <table className="w-full">
        <thead>
          <tr className="border-b border-purple-500/20">
            <th className="text-left py-3 text-gray-300">Year</th>
            <th className="text-left py-3 text-gray-300">Price</th>
            <th className="text-left py-3 text-gray-300">Market Cap</th>
            <th className="text-left py-3 text-gray-300">ROI</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-purple-500/10">
              <td className="py-3 text-white">{row.year}</td>
              <td className="py-3 text-white">${row.price.toFixed(2)}</td>
              <td className="py-3 text-white">${row.marketCap}</td>
              <td className="py-3 text-purple-400 font-medium">{row.roi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
