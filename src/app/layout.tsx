import type { Metadata } from "next";
import "./globals.css";
import { DataSourceProvider } from "@/contexts/DataSourceContext";

export const metadata: Metadata = {
  title: "EC2 Observability Dashboard | Tracer",
  description:
    "Monitor your EC2 instances for cost optimization opportunities. Identify underutilized resources and potential savings across your cloud infrastructure.",
  keywords: [
    "EC2",
    "AWS",
    "cloud",
    "observability",
    "cost optimization",
    "infrastructure monitoring",
  ],
  authors: [{ name: "Tracer", url: "https://tracer.cloud" }],
  creator: "Tracer",
  publisher: "Tracer",
  applicationName: "Tracer EC2 Observability Dashboard",
  metadataBase: new URL("https://tracer.cloud"),
  openGraph: {
    title: "EC2 Observability Dashboard | Tracer",
    description:
      "Monitor your EC2 instances for cost optimization opportunities. Identify underutilized resources and potential savings.",
    siteName: "Tracer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EC2 Observability Dashboard | Tracer",
    description:
      "Monitor your EC2 instances for cost optimization opportunities.",
    creator: "@tracer",
  },
  icons: {
    icon: "/tracer-favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <DataSourceProvider>{children}</DataSourceProvider>
      </body>
    </html>
  );
}
