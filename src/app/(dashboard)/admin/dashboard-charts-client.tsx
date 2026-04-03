"use client"

import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from "recharts";

export interface DashboardChartsClientProps {
    data: any[];
}

export default function DashboardChartsClient({ data }: DashboardChartsClientProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
          />
          <Tooltip 
             contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #f1f5f9', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontSize: '11px',
                fontWeight: 600
             }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#4f46e5" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRev)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
