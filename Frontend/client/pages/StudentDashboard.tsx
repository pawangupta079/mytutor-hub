import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Clock, DollarSign, BookOpen, Star, Loader2 } from "lucide-react";
import { apiClient } from "../../shared/api";

export default function StudentDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => apiClient.getDashboard()
  });

  const chartConfig = useMemo(() => ({ hours: { label: "Hours" } }), []);

  // Process data for charts
  const progressData = useMemo(() => {
    if (!dashboardData?.data?.sessions) return [];
    
    const subjectHours: { [key: string]: number } = {};
    dashboardData.data.sessions.forEach((session: any) => {
      if (session.status === 'completed') {
        const subject = session.subject;
        const hours = session.duration / 60;
        subjectHours[subject] = (subjectHours[subject] || 0) + hours;
      }
    });

    return Object.entries(subjectHours).map(([subject, hours]) => ({
      subject,
      hours: Math.round(hours * 10) / 10
    }));
  }, [dashboardData]);

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const upcomingSessions = dashboardData?.data?.upcomingSessions || [];
  const payments = dashboardData?.data?.payments || [];

  return (
    <main className="container grid gap-6 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="hidden rounded-lg border bg-white p-4 lg:block">
        <nav className="grid gap-2 text-sm">
          <Button variant="ghost" className="justify-start">
            Overview
          </Button>
          <Button variant="ghost" className="justify-start">
            Sessions
          </Button>
          <Button variant="ghost" className="justify-start">
            Payments
          </Button>
          <Button variant="ghost" className="justify-start">
            Reviews
          </Button>
          <Button variant="ghost" className="justify-start">
            Profile
          </Button>
        </nav>
      </aside>

      <section className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.data?.sessions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time sessions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled sessions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${payments.reduce((sum: number, payment: any) => sum + payment.amount, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                All time spending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">
                Session ratings
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {upcomingSessions.length === 0 ? (
                <p className="text-muted-foreground">No upcoming sessions</p>
              ) : (
                <ul className="grid gap-3">
                  {upcomingSessions.slice(0, 5).map((session: any) => (
                    <li key={session._id} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{session.subject}</span>
                        <p className="text-xs text-muted-foreground">
                          with {session.tutor?.user?.name || 'Tutor'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {new Date(session.scheduledDate).toLocaleDateString()}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.scheduledDate).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Progress Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {progressData.length === 0 ? (
                <div className="flex items-center justify-center h-[220px] text-muted-foreground">
                  No completed sessions yet
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <BarChart data={progressData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="subject"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="hours" fill="hsl(var(--primary))" radius={6} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-muted-foreground">No payment history</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.slice(0, 5).map((payment: any) => (
                      <TableRow key={payment._id}>
                        <TableCell>
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {payment.session?.tutor?.user?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {payment.session?.subject || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          ${payment.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate('/find-tutor')}
              >
                Find a Tutor
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/schedule')}
              >
                View All Sessions
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/payments')}
              >
                Payment History
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
