import { useDashboardStats } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, FileText, Banknote, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    );
  }

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const metrics = [
    { 
      title: "Total Admitted", 
      value: data.programsIntake.reduce((acc: number, curr: any) => acc + curr.admitted, 0),
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      title: "Total Intake Capacity", 
      value: data.programsIntake.reduce((acc: number, curr: any) => acc + curr.intake, 0),
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    { 
      title: "Pending Documents", 
      value: data.pendingDocuments,
      icon: FileText,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    { 
      title: "Pending Fees", 
      value: data.pendingFees,
      icon: Banknote,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening with admissions today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <Card key={i} className="rounded-2xl border-border/50 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${m.bg} ${m.color}`}>
                <m.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{m.title}</p>
                <h3 className="text-2xl font-display font-bold mt-1">{m.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 rounded-2xl border-border/50 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle className="font-display">Program-wise Admission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.programsIntake} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="program" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
                  <Bar dataKey="intake" name="Total Intake" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="admitted" name="Admitted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 rounded-2xl border-border/50 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle className="font-display">Quota Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.quotaStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="filled"
                    nameKey="quotaType"
                    stroke="none"
                  >
                    {data.quotaStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full mt-4 space-y-3">
              {data.quotaStats.map((q: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                    <span className="font-medium">{q.quotaType}</span>
                  </div>
                  <span className="text-muted-foreground">{q.filled} filled / {q.remaining} remaining</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
