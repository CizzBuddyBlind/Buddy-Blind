
import './globals.css'
import Navbar from '@/components/Navbar'
import ColorProvider from '@/components/ColorProvider'
import { AuthProvider } from '@/components/AuthContext'
import AdminEditor from '@/components/AdminEditor'

export const metadata={title:'BUDDY BLIND V9',description:'You dont know who you will meet'}

export default function RootLayout({children}:{children:React.ReactNode}){
  return(
    <html lang="en">
      <body className="bg-[#080808] antialiased">
        <ColorProvider>
          <AuthProvider>
            <AdminEditor>
              <Navbar />
              {children}
            </AdminEditor>
          </AuthProvider>
        </ColorProvider>
      </body>
    </html>
  )
}
