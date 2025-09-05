import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

const earnings = [
  { month: "Jan", value: 420 },
  { month: "Feb", value: 610 },
  { month: "Mar", value: 540 },
  { month: "Apr", value: 800 },
  { month: "May", value: 760 },
  { month: "Jun", value: 920 },
];

export default function TutorDashboard() {
  return (
    <main className="container grid gap-6 py-10">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$3,050</div>
            <p className="text-sm text-foreground/60">This Month</p>
            <ChartContainer config={{ value: { label: "Earnings" } }} className="mt-4 h-[180px]">
              <LineChart data={earnings}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={6} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-2">
            {["Tue 6pm - Rahul (Math)", "Thu 7pm - Aisha (Physics)", "Fri 5pm - Arjun (Chemistry)", "Sat 11am - Neha (Biology)"].map((s) => (
              <div key={s} className="flex items-center justify-between rounded-md border p-3">
                <span>{s}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Reschedule</Button>
                  <Button size="sm" variant="destructive">Cancel</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Availability Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-foreground/60">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <div key={d} className="font-medium">{d}</div>
              ))}
              {Array.from({ length: 7 * 6 }).map((_, i) => (
                <div key={i} className={`h-10 rounded-md border ${i % 3 === 0 ? "bg-primary/10" : "bg-white"}`}></div>
              ))}
            </div>
            <Button className="mt-4">Save Availability</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reviews & Feedback</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {["Great explanation of calculus!","Very patient and helpful.","Helped improve my confidence."].map((r, i) => (
              <div key={i} className="rounded-md border p-3">
                <p className="font-medium">Student {i + 1}</p>
                <p className="text-foreground/70">{r}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
