import type{Metadata}from"next";import"./globals.css";
export const metadata:Metadata={title:{default:"Nesport · Carreras y eventos",template:"%s · Nesport"},description:"Organización de carreras atléticas, inscripciones, kits, dorsales y control de tiempos.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
