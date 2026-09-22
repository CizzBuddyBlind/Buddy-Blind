import './globals.css'
export const metadata = { title: 'Buddy Blind', description: 'No Names. No Photos. Just Good Taste.' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>)
}
