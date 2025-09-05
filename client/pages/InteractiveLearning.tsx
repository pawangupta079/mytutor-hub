import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InteractiveLearning() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let rect = canvas.getBoundingClientRect();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
      rect = canvas.getBoundingClientRect();
    };

    resize();
    window.addEventListener("resize", resize);

    const move = (e: MouseEvent) => {
      if (!drawing) return;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#2563EB";
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    };

    const down = (e: MouseEvent) => {
      setDrawing(true);
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const up = () => setDrawing(false);

    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [drawing]);

  return (
    <main className="container grid gap-6 py-10 lg:grid-cols-[2fr_1fr]">
      <section className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Video Call Window</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg border bg-black/80" />
            <div className="mt-3 flex gap-2">
              <Button>Start</Button>
              <Button variant="secondary">Record</Button>
              <Button variant="destructive">End</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Whiteboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[360px] w-full overflow-hidden rounded-lg border bg-white">
              <canvas ref={canvasRef} className="h-full w-full" />
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto rounded-md border p-3 text-sm">
              <p className="text-foreground/60">Welcome to the session! Ask questions here.</p>
            </div>
            <div className="mt-3 flex gap-2">
              <Input placeholder="Type your message" />
              <Button>Send</Button>
            </div>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}
