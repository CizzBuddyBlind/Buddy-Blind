import './globals.css';
import { SiteContentProvider } from '../components/useSiteContent';
import FounderBar from '../components/FounderBar';

export const metadata = {
  title: 'Buddy Blind V9 Heart',
  description: 'That is the point.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteContentProvider>
          {children}
          <FounderBar />
        </SiteContentProvider>
      </body>
    </html>
  );
}
