import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Payment() {
  return (
    <main className="container py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm text-foreground/70">Tutor Name</label>
              <Input defaultValue="Ananya Sharma" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-foreground/70">Session Price</label>
              <Input defaultValue="$30.00" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-foreground/70">Payment Method</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe (Card)</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Card Number" />
              <Input placeholder="MM/YY" />
              <Input placeholder="CVC" />
              <Input placeholder="ZIP" />
            </div>
            <Button className="mt-2">Pay Now</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span>Session (1 hr)</span>
              <span>$30.00</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>Processing Fee</span>
              <span>$1.50</span>
            </div>
            <div className="mt-3 border-t pt-3 text-sm font-semibold">
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span>$31.50</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
