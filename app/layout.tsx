import './globals.css'
import Navbar from '@/components/Navbar'
export const metadata={title:'BUDDY BLIND V9',description:'You dont know who you will meet. Thats the point.'}
export default function RootLayout({children}:{children:React.ReactNode}){return(<html lang="en"><body className="bg-[#080808] antialiased"><Navbar/>{children}</body></html>)}