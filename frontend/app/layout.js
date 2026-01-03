import './globals.css'
import { AuthProvider } from './context/AuthContext'

export const metadata = {
  title: 'Task Manager',
  description: 'A simple task manager app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}