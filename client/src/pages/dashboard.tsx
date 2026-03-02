import { useDashboardStats } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, FileText, Banknote, TrendingUp, AlertCircle, CheckCircle, Clock, Target } from "lucide-react";
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

  const totalAdmitted = data.programsIntake.reduce((acc: number, curr: any) => acc + curr.admitted, 0);
  const totalIntake = data.programsIntake.reduce((acc: number, curr: any) => acc + curr.intake, 0);
  const fillRate = totalIntake > 0 ? ((totalAdmitted / totalIntake) * 100).toFixed(1) : 0;
  const remainingSeats = totalIntake - totalAdmitted;

  const metrics = [
    { 
      title: "Total Admitted", 
      value: totalAdmitted,
      subtitle: `${fillRate}% filled`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      title: "Remaining Seats", 
      value: remainingSeats,
      subtitle: `of ${totalIntake} total`,
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    { 
      title: "Pending Documents", 
      value: data.pendingDocuments,
      subtitle: "Need verification",
      icon: FileText,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    { 
      title: "Pending Fees", 
      value: data.pendingFees,
      subtitle: "Awaiting payment",
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
                <p className="text-xs text-muted-foreground mt-1">{m.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview Card */}
        <Card className="col-span-1 rounded-2xl border-border/50 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle className="font-display">Admission Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Fill Rate</span>
                <span className="font-bold text-primary">{fillRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-500" 
                  style={{width: `${fillRate}%`}}
                />
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Confirmed</span>
                </div>
                <span className="font-bold text-blue-600">{totalAdmitted}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium">In Progress</span>
                </div>
                <span className="font-bold text-amber-600">{data.pendingFees}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">Available</span>
                </div>
                <span className="font-bold text-emerald-600">{remainingSeats}</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle className="font-display">Quota-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.quotaStats.map((q: any, i: number) => {
                const quotaFillRate = q.filled + q.remaining > 0 ? ((q.filled / (q.filled + q.remaining)) * 100).toFixed(0) : 0;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                        <span className="font-medium">{q.quotaType}</span>
                      </div>
                      <span className="text-muted-foreground">{q.filled} / {q.filled + q.remaining} ({quotaFillRate}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500" 
                        style={{width: `${quotaFillRate}%`, backgroundColor: COLORS[i % COLORS.length]}}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle className="font-display">Action Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.pendingDocuments > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-amber-900 dark:text-amber-100">
                    {data.pendingDocuments} Document{data.pendingDocuments > 1 ? 's' : ''} Pending
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Review and verify applicant documents
                  </p>
                </div>
              </div>
            )}
            
            {data.pendingFees > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/20">
                <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-rose-900 dark:text-rose-100">
                    {data.pendingFees} Fee{data.pendingFees > 1 ? 's' : ''} Pending
                  </p>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                    Follow up on pending fee payments
                  </p>
                </div>
              </div>
            )}
            
            {remainingSeats > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-emerald-900 dark:text-emerald-100">
                    {remainingSeats} Seat{remainingSeats > 1 ? 's' : ''} Available
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                    Continue admission process to fill capacity
                  </p>
                </div>
              </div>
            )}
            
            {data.pendingDocuments === 0 && data.pendingFees === 0 && remainingSeats === 0 && (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-medium text-emerald-900 dark:text-emerald-100">
                    All tasks completed!
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    Admission process is up to date
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
        <CardHeader>
          <CardTitle className="font-display">Program Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.programsIntake.map((prog: any, idx: number) => {
              const progFillRate = prog.intake > 0 ? ((prog.admitted / prog.intake) * 100).toFixed(0) : 0;
              const remaining = prog.intake - prog.admitted;
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{prog.program}</span>
                      <span className="text-xs text-muted-foreground">
                        {prog.admitted} / {prog.intake} ({progFillRate}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          Number(progFillRate) >= 90 ? 'bg-emerald-500' : 
                          Number(progFillRate) >= 70 ? 'bg-blue-500' : 
                          Number(progFillRate) >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{width: `${progFillRate}%`}}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-xs font-medium text-muted-foreground">
                      {remaining} left
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
