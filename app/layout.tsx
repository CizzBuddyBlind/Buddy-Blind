
import './globals.css'
import AdminEditor from "@/components/AdminEditor"
import Navbar from '@/components/Navbar'
import ColorProvider from '@/components/ColorProvider'
import { AuthProvider } from '@/components/AuthContext'
export const metadata={title:'BUDDY BLIND V9',description:'You dont know who you will meet'}
export default function RootLayout(<AdminEditor>{children}</AdminEditor>:{children:React.ReactNode}){
  return(
    <html lang="en">
      <body className="bg-[#080808] antialiased">
        <AuthProvider>
          <ColorProvider>
            <Navbar/><AdminEditor>{children}</AdminEditor>
          </ColorProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
