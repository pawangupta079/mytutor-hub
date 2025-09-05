import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CheckCircle2, Calendar, ShieldCheck, Video, Search, Star } from "lucide-react";

export default function Index() {
  const testimonials = [
    {
      name: "Aarav S.",
      role: "Class 10 Student",
      text:
        "Found a great Math tutor and improved two grades in a month. Scheduling and tracking are super easy!",
      rating: 5,
    },
    {
      name: "Neha K.",
      role: "Parent",
      text:
        "The platform is intuitive. Loved the secure payments and progress analytics for my daughter.",
      rating: 5,
    },
    {
      name: "Rohan M.",
      role: "Physics Tutor",
      text:
        "As a tutor, managing availability and sessions is seamless. Earnings dashboard is very clear.",
      rating: 5,
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent to-white">
        <div className="container grid items-center gap-10 py-20 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              Learn Smarter with <span className="text-primary">Expert Tutors</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-foreground/70">
              Discover top tutors, book sessions effortlessly, and track your learning journey — all in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/find-tutor">Find a Tutor</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Link to="/register-tutor">Register as Tutor</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-foreground/70">
              <CheckCircle2 className="h-4 w-4 text-secondary" />
              Join 1000+ learners today!
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video w-full overflow-hidden rounded-xl border bg-white shadow-xl">
              <div className="grid h-full place-items-center text-foreground/60">
                <Video className="h-10 w-10" />
                <p className="mt-2 text-sm">Intro video or illustration</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur md:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Easy Scheduling</p>
                  <p className="text-xs text-foreground/60">Book in a few taps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Everything you need to learn efficiently</h2>
          <p className="mt-2 text-foreground/70">Powerful features to discover tutors, book sessions, and learn interactively.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
                <Search />
              </div>
              <CardTitle className="mt-2 text-xl">Tutor Search</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/70">
              Find tutors by subject, location, rating, and price to match your goals.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
                <Video />
              </div>
              <CardTitle className="mt-2 text-xl">Interactive Learning</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/70">
              Engage through video, whiteboard tools, and real-time chat.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
                <Calendar />
              </div>
              <CardTitle className="mt-2 text-xl">Session Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/70">
              View availability and book sessions at times that suit you.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck />
              </div>
              <CardTitle className="mt-2 text-xl">Secure Payments</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/70">
              Pay with confidence using trusted payment options.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="container">
          <h2 className="text-3xl font-bold">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              { step: 1, title: "Search Tutor", desc: "Filter by subject, price, and rating" },
              { step: 2, title: "Book Session", desc: "Pick a slot that fits your schedule" },
              { step: 3, title: "Learn Online", desc: "Interact via video, whiteboard, and chat" },
              { step: 4, title: "Track Progress", desc: "See analytics and performance over time" },
            ].map((s) => (
              <div key={s.step} className="relative rounded-lg border bg-background p-6">
                <div className="absolute -top-3 left-6 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground shadow">
                  {s.step}
                </div>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-foreground/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Loved by students and tutors</h2>
          <p className="mt-2 text-foreground/70">Real stories from our community</p>
        </div>
        <div className="mt-10">
          <Carousel>
            <CarouselContent>
              {testimonials.map((t, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full">
                    <CardContent className="flex h-full flex-col justify-between p-6">
                      <p className="text-foreground/80">“{t.text}”</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{t.name}</p>
                          <p className="text-sm text-foreground/60">{t.role}</p>
                        </div>
                        <div className="flex items-center gap-1 text-secondary">
                          {Array.from({ length: t.rating }).map((_, k) => (
                            <Star key={k} size={16} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold">Join 1000+ learners today!</h3>
            <p className="mt-2 text-foreground/70">Start your learning journey with personalized tutoring.</p>
          </div>
          <div className="flex gap-3 md:justify-end">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/find-tutor">Find a Tutor</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Link to="/register-tutor">Register as Tutor</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
