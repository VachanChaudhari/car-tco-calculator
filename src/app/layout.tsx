import type { Metadata } from "next";
import "./globals.css";
import ThemeWrapper from "@/components/ThemeWrapper";

export const metadata: Metadata = {
  title: "Car Ownership Cost Calculator India - Compare TCO (Taxes, Fuel, Resale, EMI)",
  description: "Calculate and compare the true total cost of ownership (TCO) for multiple cars in India. Includes registration, road tax, fuel inflation, maintenance schedules, interest rates, and estimated resale value.",
  keywords: "car comparison, TCO calculator, ownership cost India, car finance EMI, resale depreciation, EV vs ICE cost, road tax Delhi Maharashtra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}
