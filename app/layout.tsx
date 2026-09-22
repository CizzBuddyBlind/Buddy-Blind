import './globals.css'
import Navbar from '@/components/Navbar'
export const metadata={title:'BUDDY BLIND - V9 Heart',description:'No names. No photos. Just good taste.'}
export default function RootLayout({children}:{children:React.ReactNode}){return(<html lang="en"><body><Navbar/>{children}</body></html>)}