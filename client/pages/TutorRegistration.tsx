import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  "Personal Info",
  "Expertise",
  "Pricing & Availability",
  "Review & Submit",
];

export default function TutorRegistration() {
  const [step, setStep] = useState(0);

  return (
    <main className="container py-10">
      <h1 className="text-3xl font-bold">Register as a Tutor</h1>

      {/* Progress */}
      <div className="mt-6 grid gap-2 sm:grid-cols-4">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`rounded-lg border p-3 text-sm ${i <= step ? "border-primary" : "border-border"}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`font-medium ${i <= step ? "text-primary" : "text-foreground/70"}`}
              >
                {s}
              </span>
              <span
                className={`h-6 w-6 rounded-full text-center text-xs leading-6 ${i <= step ? "bg-primary text-white" : "bg-muted text-foreground/70"}`}
              >
                {i + 1}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-foreground/70">
                  Full Name
                </label>
                <Input placeholder="Enter your full name" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/70">
                  Email
                </label>
                <Input type="email" placeholder="Enter your email" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-foreground/70">
                  Bio
                </label>
                <Textarea placeholder="Short introduction about you" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/70">
                  Location
                </label>
                <Input placeholder="City, Country" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/70">
                  Profile Picture
                </label>
                <Input type="file" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-foreground/70">
                  Subjects
                </label>
                <Input placeholder="e.g., Math, Physics" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/70">
                  Qualification
                </label>
                <Input placeholder="e.g., M.Sc. Physics" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/70">
                  Experience
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 years</SelectItem>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="10">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/70">
                  Certificates
                </label>
                <Input type="file" multiple />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-foreground/70">
                  Hourly Rate ($)
                </label>
                <Input type="number" placeholder="e.g., 25" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/70">
                  Availability
                </label>
                <Input placeholder="e.g., Weekdays 6-9 PM" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-foreground/70">
                  Calendar Slots
                </label>
                <Textarea placeholder="List available time slots" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-2 text-sm">
              <p>
                Review your details and submit. You can edit this information
                later from your dashboard.
              </p>
              <ul className="list-inside list-disc text-foreground/70">
                <li>Personal details</li>
                <li>Subjects and qualifications</li>
                <li>Rates and availability</li>
              </ul>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button
                onClick={() =>
                  setStep((s) => Math.min(steps.length - 1, s + 1))
                }
              >
                Next
              </Button>
            ) : (
              <Button className="bg-primary">Submit</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
