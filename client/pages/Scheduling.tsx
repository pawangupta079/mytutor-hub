import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const slots = ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","4:00 PM","6:00 PM"];

export default function Scheduling() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main className="container grid gap-6 py-10 md:grid-cols-[1fr_1fr]">
      <section>
        <h1 className="text-3xl font-bold">Session Scheduling</h1>
        <p className="mt-1 text-foreground/70">Pick a date and choose an available slot.</p>
        <div className="mt-6 rounded-lg border p-4">
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Available Slots</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {slots.map((s) => (
            <Dialog key={s}>
              <DialogTrigger asChild>
                <Button variant={selected === s ? "default" : "outline"} onClick={() => setSelected(s)}>{s}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Booking</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-foreground/70">
                  Tutor: Ananya Sharma
                  <br />
                  Date: {date?.toDateString()} at {s}
                </div>
                <Button className="mt-4">Confirm</Button>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </section>
    </main>
  );
}
