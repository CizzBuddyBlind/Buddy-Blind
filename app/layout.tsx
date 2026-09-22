import './globals.css';
export const metadata={title:'Buddy Blind - V9 Heart', description:'Blind Dining Hong Kong'};
export default function RootLayout({children}:{children:React.ReactNode}){ return <html lang="en"><body className="bg-[#050505] text-white antialiased selection:bg-amber-400 selection:text-black">{children}</body></html>; }
