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
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 30 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: '900', textAnchor: 'middle' }}
            dy={16}
            interval="preserveStartEnd"
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: '900' }}
            dx={-8}
          />
          <Tooltip 
             cursor={{ stroke: '#14b8a6', strokeWidth: 1, strokeDasharray: '4 4' }}
             contentStyle={{ 
                borderRadius: '24px', 
                border: 'none', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                fontSize: '11px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)'
             }}
             itemStyle={{ color: '#0f172a', padding: '0' }}
             labelStyle={{ color: '#64748b', marginBottom: '10px', fontSize: '9px', letterSpacing: '0.3em' }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#14b8a6" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
