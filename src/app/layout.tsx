import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { Toaster } from "@/components/ui/toaster";
// import { parseHash, setupUrlListener } from "@/lib/hash-navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MDT - Design & Inspiration",
  description: "Share the latest design and artificial intelligence consulting weekly news",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="overflow-hidden">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                
                // 解析URL哈希并设置相应状态
                function parseAndSetState() {
                  const hash = window.location.hash.substring(1);
                  if (!hash) return;
                  
                  // 延迟执行以确保组件已挂载
                  setTimeout(() => {
                    const event = new CustomEvent('hashchange:manual', { detail: { hash } });
                    window.dispatchEvent(event);
                  }, 100);
                }
                
                // 监听哈希变化
                window.addEventListener('hashchange', parseAndSetState);
                
                // 初始化时解析哈希
                if (window.location.hash) {
                  parseAndSetState();
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
        style={{
          backgroundImage: "url('/background.png')",
          backgroundPosition: "center center",
          backgroundSize: "auto",
          backgroundRepeat: "repeat",
          backgroundAttachment: "fixed"
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            {/* <Toaster /> */}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
