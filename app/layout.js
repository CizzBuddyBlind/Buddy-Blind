export const metadata = { title: 'Buddy Blind - 香港盲盒交友飯局', description: '每晚 6 個陌生人，一齊食飯' }
export default function RootLayout({ children }) {
  return (
    <html lang="zh-HK">
      <body style={{margin:0, fontFamily:'-apple-system, sans-serif', background:'#FFF9F0'}}>{children}</body>
    </html>
  )
}
