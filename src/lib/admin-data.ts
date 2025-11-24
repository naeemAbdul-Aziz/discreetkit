import { createSupabaseServerClient } from "@/lib/supabase"

export async function getDashboardStats() {
    const supabase = await createSupabaseServerClient()

    // 1. Total Revenue & Order Count
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_price, created_at, status')

    if (ordersError) throw ordersError

    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0)
    const totalOrders = orders.length

    // 2. Active Partners
    const { count: activePartners, error: partnersError } = await supabase
        .from('pharmacies')
        .select('*', { count: 'exact', head: true })

    if (partnersError) throw partnersError

    // 3. Recent Sales (Last 5 orders)
    const { data: recentSales, error: recentError } = await supabase
        .from('orders')
        .select('id, code, total_price, email, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5)

    if (recentError) throw recentError

    // 4. "Active Now" proxy (Orders in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const newOrders = orders.filter(o => o.created_at >= oneDayAgo)
    const activeNow = newOrders.length

    // Low Stock
    const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock_level', 10)

    // Revenue Trend (Last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: trendData } = await supabase
        .from('orders')
        .select('created_at, total_price')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true })

    // Process trend data
    const revenueTrend = processRevenueTrend(trendData || [])

    // Order Status Distribution
    const orderStatusDistribution = processStatusDistribution(orders || [])

    // 5. Comparisons for Insights
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const sevenDaysAgoDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Filter orders for periods
    const currentPeriodOrders = orders.filter(o => new Date(o.created_at) >= thirtyDaysAgo)
    const previousPeriodOrders = orders.filter(o => {
        const d = new Date(o.created_at)
        return d >= sixtyDaysAgo && d < thirtyDaysAgo
    })

    // Calculate Revenue Change
    const currentRevenue = currentPeriodOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
    const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
    const revenueChange = previousRevenue === 0 ? 100 : ((currentRevenue - previousRevenue) / previousRevenue) * 100

    // Calculate Orders Change
    const currentOrdersCount = currentPeriodOrders.length
    const previousOrdersCount = previousPeriodOrders.length
    const ordersChange = previousOrdersCount === 0 ? 100 : ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100

    // New Partners (Last 7 days)
    const { count: newPartners } = await supabase
        .from('pharmacies')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgoDate.toISOString())

    return {
        totalRevenue: totalRevenue || 0,
        totalOrders: totalOrders || 0,
        activePartners: activePartners || 0,
        activeNow,
        recentSales: recentSales || [],
        lowStockCount: lowStockCount || 0,
        revenueTrend,
        orderStatusDistribution,
        insights: {
            revenueChange: Math.round(revenueChange),
            ordersChange: Math.round(ordersChange),
            newPartners: newPartners || 0
        }
    }
}

function processRevenueTrend(data: any[]) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const trend = new Map<string, number>()

    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayName = days[d.getDay()]
        trend.set(dayName, 0)
    }

    data.forEach(order => {
        const d = new Date(order.created_at)
        const dayName = days[d.getDay()]
        if (trend.has(dayName)) {
            trend.set(dayName, (trend.get(dayName) || 0) + Number(order.total_price))
        }
    })

    return Array.from(trend.entries()).map(([name, total]) => ({ name, total }))
}

function processStatusDistribution(data: any[]) {
    const distribution: Record<string, number> = {}
    data.forEach(order => {
        const status = order.status || 'unknown'
        distribution[status] = (distribution[status] || 0) + 1
    })

    return Object.entries(distribution).map(([name, value]) => ({ name, value }))
}
