import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const tutors = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name: ["Ananya", "Rohit", "Priya", "Vikram", "Meera"][i % 5] + " "+ ["Sharma", "Gupta", "Iyer", "Khan", "Das"][i % 5],
  subject: ["Math", "Physics", "Chemistry", "Biology", "English"][i % 5],
  rating: 4 + (i % 2),
  price: 10 + i,
}));

export default function FindTutor() {
  const [price, setPrice] = useState([30]);

  return (
    <main className="container grid gap-8 py-10 md:grid-cols-[280px_1fr]">
      <aside className="hidden rounded-lg border bg-white p-5 md:block">
        <h3 className="font-semibold">Filters</h3>
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <label className="mb-1 block text-foreground/70">Price range ($/hr)</label>
            <Slider value={price} onValueChange={setPrice} min={10} max={100} step={5} />
            <div className="mt-1 text-xs text-foreground/60">Up to ${price[0]}/hr</div>
          </div>
          <div>
            <label className="mb-1 block text-foreground/70">Rating</label>
            <Select defaultValue="4+">
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="4+">4+ stars</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-foreground/70">Experience</label>
            <Select defaultValue=">=2">
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value=">=2">2+ years</SelectItem>
                <SelectItem value=">=5">5+ years</SelectItem>
                <SelectItem value=">=10">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </aside>

      <section>
        <div className="rounded-lg border bg-white p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <Input placeholder="Subject (e.g., Math)" />
            <Input placeholder="Location (e.g., Delhi)" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekday">Weekdays</SelectItem>
                <SelectItem value="weekend">Weekends</SelectItem>
                <SelectItem value="evening">Evenings</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Search</Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tutors
            .filter((t) => t.price <= price[0])
            .map((t) => (
              <Card key={t.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{t.name}</span>
                    <span className="text-sm text-foreground/60">${t.price}/hr</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-foreground/70">
                    <span>{t.subject}</span>
                    <span className="flex items-center gap-1 text-secondary">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </span>
                  </div>
                  <Button className="mt-4 w-full">Book Now</Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>
    </main>
  );
}
