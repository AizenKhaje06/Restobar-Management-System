"use client"

import { useState, useEffect, useTransition } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Download,
  Calendar,
  CreditCard,
  RefreshCw
} from "lucide-react"
import { formatCurrency } from "@/lib/constants"
import { getCashflowData, exportCashflowToCSV, type CashflowData } from "@/app/actions/cashflow"
import { 
  LineChart, 
  Line,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from "recharts"
import { toast } from "sonner"

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  gcash: "GCash",
  online: "Online",
}

export function CashflowDashboard() {
  const [data, setData] = useState<CashflowData | null>(null)
  const [dateRange, setDateRange] = useState("30")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [pending, startTransition] = useTransition()

  const loadData = () => {
    startTransition(async () => {
      const now = new Date()
      const startDate = new Date()
      
      switch (dateRange) {
        case "7":
          startDate.setDate(now.getDate() - 7)
          break
        case "30":
          startDate.setDate(now.getDate() - 30)
          break
        case "90":
          startDate.setDate(now.getDate() - 90)
          break
        case "365":
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate.setDate(now.getDate() - 30)
      }

      const result = await getCashflowData({
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        paymentMethod: paymentFilter,
      })

      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setData(result.data)
      }
    })
  }

  useEffect(() => {
    loadData()
  }, [dateRange, paymentFilter])

  const handleExport = async () => {
    const now = new Date()
    const startDate = new Date()
    startDate.setDate(now.getDate() - parseInt(dateRange))

    const result = await exportCashflowToCSV({
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      paymentMethod: paymentFilter,
    })

    if (result.error) {
      toast.error(result.error)
    } else if (result.data) {
      const blob = new Blob([result.data], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `cashflow-${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success("Cashflow data exported successfully")
    }
  }

  if (!data && pending) {
    return <div className="p-6">Loading...</div>
  }

  if (!data) {
    return <div className="p-6">No data available</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cashflow & Analytics"
        description="Track revenue, payments, and financial performance"
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Cashflow" }]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={loadData} disabled={pending}>
              <RefreshCw className={`mr-2 size-4 ${pending ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleExport}>
              <Download className="mr-2 size-4" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={dateRange} onValueChange={(value) => value && setDateRange(value)}>
          <SelectTrigger className="w-40">
            <Calendar className="mr-2 size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={(value) => value && setPaymentFilter(value)}>
          <SelectTrigger className="w-44">
            <CreditCard className="mr-2 size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="cash">Cash only</SelectItem>
            <SelectItem value="card">Card only</SelectItem>
            <SelectItem value="gcash">GCash only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {data.totalOrders} paid orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="size-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{formatCurrency(data.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Operating costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.netProfit >= 0 ? "text-blue-600" : "text-rose-600"}`}>
              {formatCurrency(data.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.profitMargin.toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <ShoppingCart className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(data.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Expenses Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenueByDay}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tickFormatter={(value) => new Date(value).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  labelFormatter={(label: any) => label ? new Date(label).toLocaleDateString("en-PH") : ""}
                />
                <Legend />
                <Area 
                  type="monotoneX" 
                  dataKey="revenue" 
                  name="Revenue"
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  fillOpacity={1}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Area 
                  type="monotoneX" 
                  dataKey="expenses" 
                  name="Expenses"
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fill="url(#colorExpenses)"
                  fillOpacity={1}
                  dot={{ fill: "#ef4444", r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topSellingItems.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {data.paymentMethodBreakdown.map((method, index) => (
              <div key={method.method} className="flex items-center gap-3 rounded-lg border p-4">
                <div 
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                >
                  {method.count}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {PAYMENT_METHOD_LABELS[method.method as string] || method.method}
                  </div>
                  <div className="text-lg font-bold">{formatCurrency(method.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Items Table - Removed old chart */}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Order #</th>
                  <th className="pb-2 text-left font-medium">Date</th>
                  <th className="pb-2 text-left font-medium">Customer</th>
                  <th className="pb-2 text-left font-medium">Table</th>
                  <th className="pb-2 text-left font-medium">Payment</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.slice(0, 20).map((txn) => (
                  <tr key={txn.id} className="border-b last:border-0">
                    <td className="py-2">#{txn.order_number.toString().slice(-6)}</td>
                    <td className="py-2 text-muted-foreground">
                      {new Date(txn.created_at).toLocaleDateString("en-PH")}
                    </td>
                    <td className="py-2">{txn.customer_name || "Walk-in"}</td>
                    <td className="py-2">{txn.table_label || "Take-Out"}</td>
                    <td className="py-2 capitalize">{PAYMENT_METHOD_LABELS[txn.payment_method] || txn.payment_method}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(txn.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
