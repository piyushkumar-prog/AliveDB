"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface UptimeDataPoint {
  date: string;
  uptime: number;
  total: number;
  success: number;
}

interface UptimeChartProps {
  data: UptimeDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: UptimeDataPoint }>;
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
      <div style={{ fontWeight: "600", color: "#0a0a0a", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ color: "#22c55e", fontWeight: "600" }}>{d.uptime}% uptime</div>
      <div style={{ color: "#9ca3af", marginTop: "2px" }}>
        {d.success} / {d.total} pings successful
      </div>
    </div>
  );
};

export function UptimeChart({ data }: UptimeChartProps) {
  if (data.length === 0) {
    return (
      <div
        style={{
          height: "160px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "13px",
        }}
      >
        No data yet. Run your first ping to see the chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="uptimeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="uptime"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#uptimeFill)"
          dot={false}
          activeDot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
