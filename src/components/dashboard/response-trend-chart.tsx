"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import type { ResponsesTrendPoint } from "@/lib/repositories/responses";

type Props = {
  data: ResponsesTrendPoint[];
};

export const ResponseTrendChart = ({ data }: Props) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" strokeDasharray="4 6" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={12}
            stroke="rgba(226, 232, 240, 0.5)"
            tick={{ fill: "rgba(226,232,240,0.6)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={12}
            allowDecimals={false}
            stroke="rgba(226, 232, 240, 0.4)"
            tick={{ fill: "rgba(226,232,240,0.6)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15,23,42,0.95)",
              borderRadius: "12px",
              border: "1px solid rgba(148,163,184,0.2)",
              color: "#f8fafc",
            }}
            cursor={{ stroke: "rgba(125,211,252,0.4)" }}
          />
          <Line
            type="monotone"
            dataKey="responses"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
