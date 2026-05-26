"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatResponseTime } from "@/lib/utils";

interface ResponseDataPoint {
  label: string;
  responseTime: number;
  success: boolean;
}

interface ResponseChartProps {
  data: ResponseDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: ResponseDataPoint }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "10px 14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontSize: "12px",
      }}
    >
      <div style={{ fontWeight: "600", color: "#0a0a0a", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ color: d.success ? "#22c55e" : "#ef4444", fontWeight: "600" }}>
        {formatResponseTime(d.responseTime)}
      </div>
    </div>
  );
};

export function ResponseChart({ data }: ResponseChartProps) {
  if (data.length === 0) {
    return (
      <div
        style={{
          height: "140px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "13px",
        }}
      >
        No response data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}ms`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
        <Bar dataKey="responseTime" radius={[3, 3, 0, 0]} maxBarSize={32}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.success ? "#22c55e" : "#ef4444"} fillOpacity={0.75} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
