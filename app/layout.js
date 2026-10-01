import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { BuddyProvider } from "@/components/Providers";
import { Shell } from "@/components/Shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "Buddy Blind",
  description: "You don't know who you'll meet. That's the point.",
  appleWebApp: { capable: true, title: "Buddy Blind", statusBarStyle: "black-translucent" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem("bb_lang_v1");if(!raw)return;var lang=raw.charAt(0)==="\\""?JSON.parse(raw):raw;if(!lang||lang==="en")return;var p=location.pathname;if(p==="/m"||p.indexOf("/m/")===0)return;document.documentElement.classList.add("bb-lang-wait");}catch(e){}})();`,
          }}
        />
        <BuddyProvider>
          <Shell>{children}</Shell>
        </BuddyProvider>
      </body>
    </html>
  );
}
