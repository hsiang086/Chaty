import React from 'react'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import AuthContextProvider from '@/modules/auth_provider'
import WebSocketProvider from '@/modules/websocket_provider'

import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthContextProvider>
        <WebSocketProvider>
          <div className={`min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 ${inter.className}`}>
            <Component {...pageProps} />
            <Toaster />
          </div>
        </WebSocketProvider>
      </AuthContextProvider>
    </ThemeProvider>
  )
}

export default MyApp