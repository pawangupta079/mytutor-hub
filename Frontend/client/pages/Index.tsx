import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Video,
  Search,
  Star,
} from "lucide-react";

export default function Index() {
  const testimonials = [
    {
      name: "Aarav S.",
      role: "Class 10 Student",
      text: "Found a great Math tutor and improved two grades in a month. Scheduling and tracking are super easy!",
      rating: 5,
    },
    {
      name: "Neha K.",
      role: "Parent",
      text: "The platform is intuitive. Loved the secure payments and progress analytics for my daughter.",
      rating: 5,
    },
    {
      name: "Rohan M.",
      role: "Physics Tutor",
      text: "As a tutor, managing availability and sessions is seamless. Earnings dashboard is very clear.",
      rating: 5,
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl translate-y-40 -translate-x-40"></div>
        
        <div className="container relative grid items-center gap-10 py-20 md:grid-cols-2">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
              Learn Smarter with{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Expert Tutors
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-foreground/80 leading-relaxed">
              Discover top tutors, book sessions effortlessly, and track your
              learning journey — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="btn-modern gradient-primary text-white hover:shadow-lg hover:shadow-primary/25 px-8 py-4 text-base font-semibold"
              >
                <Link to="/find-tutor">Find a Tutor</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="btn-modern border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-base font-semibold"
              >
                <Link to="/register-tutor">Register as Tutor</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-foreground/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Join 1000+ learners today!</span>
              </div>
            </div>
          </div>
          <div className="relative animate-slide-in-right">
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border/50 bg-white/80 backdrop-blur-sm shadow-modern-xl">
              <div className="grid h-full place-items-center text-foreground/60">
                <div className="text-center">
                  <Video className="h-16 w-16 mx-auto text-primary/60" />
                  <p className="mt-4 text-sm font-medium">Interactive Learning Experience</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-8 hidden rounded-2xl glass p-6 shadow-modern-lg md:block animate-slide-up">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-white shadow-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Easy Scheduling</p>
                  <p className="text-xs text-foreground/60">
                    Book in a few taps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-4">
            Everything you need to learn efficiently
          </h2>
          <p className="text-lg text-foreground/70 leading-relaxed">
            Powerful features to discover tutors, book sessions, and learn
            interactively.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-modern hover-lift group">
            <CardHeader className="pb-4">
              <div className="grid h-14 w-14 place-items-center rounded-xl gradient-primary text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Search className="h-7 w-7" />
              </div>
              <CardTitle className="mt-4 text-xl font-semibold">Tutor Search</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/70 leading-relaxed">
              Find tutors by subject, location, rating, and price to match your
              goals.
            </CardContent>
          </Card>
          <Card className="card-modern hover-lift group">
            <CardHeader className="pb-4">
              <div className="grid h-14 w-14 place-items-center rounded-xl gradient-primary text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Video className="h-7 w-7" />
              </div>
              <CardTitle className="mt-4 text-xl font-semibold">
                Interactive Learning
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/70 leading-relaxed">
              Engage through video, whiteboard tools, and real-time chat.
            </CardContent>
          </Card>
          <Card className="card-modern hover-lift group">
            <CardHeader className="pb-4">
              <div className="grid h-14 w-14 place-items-center rounded-xl gradient-primary text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-7 w-7" />
              </div>
              <CardTitle className="mt-4 text-xl font-semibold">Session Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/70 leading-relaxed">
              View availability and book sessions at times that suit you.
            </CardContent>
          </Card>
          <Card className="card-modern hover-lift group">
            <CardHeader className="pb-4">
              <div className="grid h-14 w-14 place-items-center rounded-xl gradient-primary text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <CardTitle className="mt-4 text-xl font-semibold">Secure Payments</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground/70 leading-relaxed">
              Pay with confidence using trusted payment options.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-br from-muted/30 to-background py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-foreground/70">Simple steps to start learning</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: 1,
                title: "Search Tutor",
                desc: "Filter by subject, price, and rating",
                icon: Search,
              },
              {
                step: 2,
                title: "Book Session",
                desc: "Pick a slot that fits your schedule",
                icon: Calendar,
              },
              {
                step: 3,
                title: "Learn Online",
                desc: "Interact via video, whiteboard, and chat",
                icon: Video,
              },
              {
                step: 4,
                title: "Track Progress",
                desc: "See analytics and performance over time",
                icon: Star,
              },
            ].map((s, index) => (
              <div
                key={s.step}
                className="relative group"
              >
                <div className="card-modern hover-lift p-8 text-center">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 rounded-full gradient-primary text-white flex items-center justify-center text-sm font-bold shadow-lg">
                      {s.step}
                    </div>
                  </div>
                  <div className="mt-6 mb-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <s.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{s.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-20">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Loved by students and tutors</h2>
          <p className="text-lg text-foreground/70">
            Real stories from our community
          </p>
        </div>
        <div className="mt-10">
          <Carousel className="w-full">
            <CarouselContent>
              {testimonials.map((t, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="card-modern hover-lift h-full">
                    <CardContent className="flex h-full flex-col justify-between p-8">
                      <div className="mb-6">
                        <div className="flex items-center gap-1 mb-4">
                          {Array.from({ length: t.rating }).map((_, k) => (
                            <Star key={k} size={20} className="text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-foreground/80 text-base leading-relaxed">"{t.text}"</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div>
                          <p className="font-semibold text-lg">{t.name}</p>
                          <p className="text-sm text-foreground/60">{t.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden gradient-primary py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-40 -translate-x-40"></div>
        
        <div className="container relative grid items-center gap-8 md:grid-cols-2">
          <div className="text-white">
            <h3 className="text-4xl font-bold mb-4">Join 1000+ learners today!</h3>
            <p className="text-lg text-white/90 leading-relaxed">
              Start your learning journey with personalized tutoring.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
            <Button
              asChild
              size="lg"
              className="btn-modern bg-white text-primary hover:bg-white/90 px-8 py-4 text-base font-semibold shadow-lg"
            >
              <Link to="/find-tutor">Find a Tutor</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="btn-modern border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-base font-semibold"
            >
              <Link to="/register-tutor">Register as Tutor</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
