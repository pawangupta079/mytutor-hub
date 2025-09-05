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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useMemo, useState } from "react";

const data = [
  { subject: "Math", hours: 6 },
  { subject: "Physics", hours: 4 },
  { subject: "Chemistry", hours: 3 },
  { subject: "Biology", hours: 2 },
  { subject: "English", hours: 5 },
];

export default function StudentDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const chartConfig = useMemo(() => ({ hours: { label: "Hours" } }), []);

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="grid gap-3">
                <li className="flex items-center justify-between">
                  <span>Math with Ananya</span>
                  <span className="text-foreground/60">Tue, 6pm</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Physics with Rohit</span>
                  <span className="text-foreground/60">Thu, 7pm</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>English with Meera</span>
                  <span className="text-foreground/60">Sat, 11am</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="md:col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Progress Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={data}>
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
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {[
                    ["2025-02-08", "Ananya", "Math", "$30.00"],
                    ["2025-02-02", "Rohit", "Physics", "$28.00"],
                    ["2025-01-26", "Meera", "English", "$25.00"],
                  ].map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r[0]}</TableCell>
                      <TableCell>{r[1]}</TableCell>
                      <TableCell>{r[2]}</TableCell>
                      <TableCell className="text-right">{r[3]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
              <Button className="mt-4 w-full">View Available Slots</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
