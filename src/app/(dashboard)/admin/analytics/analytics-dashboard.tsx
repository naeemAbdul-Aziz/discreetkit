"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, ShoppingBag, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface AnalyticsDashboardProps {
  data: {
    totalRevenue: number;
    totalOrders: number;
    activePatients: number;
    revenueChart: any[];
    categoryChart: any[];
    regionChart: any[];
    topProducts: any[];
    topPharmacies: any[];
  };
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const formatCurrency = (value: number) => `GHS ${value.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="font-bold text-muted-foreground">GHS</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activePatients}</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {data.totalOrders > 0 
                    ? (data.totalRevenue / data.totalOrders).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                    : 0}
            </div>
            <p className="text-xs text-muted-foreground">GHS per order</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="data-hub" className="flex items-center gap-2">
             <Download className="h-3 w-3" /> Data Hub
          </TabsTrigger>
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>
                Daily revenue performance for the last 30 days.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenueChart}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `GHS ${value}`} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip formatter={(value: number) => [`GHS ${value}`, 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
             <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Top Pharmacies</CardTitle>
                    <CardDescription>Highest revenue generating partners.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="space-y-8">
                        {data.topPharmacies.map((pharmacy: any, index: number) => (
                            <div className="flex items-center" key={index}>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{pharmacy.name}</p>
                                    <p className="text-sm text-muted-foreground">Partner since 2024</p>
                                </div>
                                <div className="ml-auto font-medium">GHS {pharmacy.revenue.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                 </CardContent>
             </Card>
             <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>Revenue by product category.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryChart}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.categoryChart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        {/* SALES TAB */}
        <TabsContent value="sales" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>Best selling items by quantity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {data.topProducts.map((product: any, index: number) => (
                            <div className="flex items-center" key={index}>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                                </div>
                                <div className="ml-auto font-medium">GHS {product.revenue.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* GEOGRAPHY TAB */}
        <TabsContent value="geography" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Delivery Areas</CardTitle>
                    <CardDescription>Order concentration by location.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={data.regionChart}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* DATA HUB TAB */}
        <TabsContent value="data-hub" className="space-y-4">
            <Card className="bg-slate-900 text-white border-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-400" />
                        DiscreetKit Data Hub
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Secure, anonymized data exports for authorized stakeholders (MoH, NGOs, Research Partners).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-emerald-400">Public Health Report</h4>
                                <p className="text-sm text-slate-400">Aggregated category trends and infection vector proxies.</p>
                            </div>
                            <Button variant="outline" className="text-black bg-white hover:bg-slate-200 border-none">
                                <Download className="mr-2 h-4 w-4" /> Export CSV
                            </Button>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-emerald-400">Supply Chain Feed</h4>
                                <p className="text-sm text-slate-400">Demand heatmaps and stock utilization rates.</p>
                            </div>
                            <Button variant="outline" className="text-black bg-white hover:bg-slate-200 border-none">
                                <Download className="mr-2 h-4 w-4" /> Export JSON
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
