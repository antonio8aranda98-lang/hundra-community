import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata={title:'HUNDRA Community · Cerca de los tuyos',description:'La comunidad de jugadores y familias de HUNDRA. Noticias, agenda, experiencias y reconocimientos.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',apple:'/brand/icon-192.png'},appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'HUNDRA'}};
export const viewport: Viewport={width:'device-width',initialScale:1,themeColor:'#080d17'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>;}
