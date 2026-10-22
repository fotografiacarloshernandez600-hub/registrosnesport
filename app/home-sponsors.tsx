"use client";
import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
type Sponsor = { id: string; name: string; description: string | null; logo_url: string; sort_order?: number };
export default function HomeSponsors({ sponsors }: { sponsors: Sponsor[] }) {
 const [active,setActive]=useState<Sponsor|null>(null);
 const crossfit={id:"crossfit-ek-balam",name:"CrossFit Ek’ Balam",description:"CrossFit Ek’ Balam acompaña a Nesport impulsando una comunidad más fuerte, disciplinada y apasionada por el deporte.",logo_url:"/crossfit-ek-balam.png",sort_order:0};
 const visible=sponsors.some(s=>s.name.toLowerCase().includes("crossfit ek"))?sponsors:[crossfit,...sponsors];
 return <section className="official-sponsor"><div><span>PATROCINADORES OFICIALES</span><h2>La fuerza detrás<br/>de cada meta.</h2><p>Conoce a las marcas, clubes y organizaciones que hacen posibles las experiencias deportivas de Nesport.</p></div><div className="home-sponsor-grid">{visible.slice(0,6).map(s=><button type="button" key={s.id} className="home-sponsor-card" onClick={()=>setActive(s)}><img src={s.logo_url} alt={s.name}/><b>{s.name}</b><small>Ver perfil <ExternalLink size={13}/></small></button>)}</div>{active&&<div className="lightbox sponsor-lightbox" onMouseDown={()=>setActive(null)}><article onMouseDown={e=>e.stopPropagation()}><button type="button" aria-label="Cerrar" onClick={()=>setActive(null)}><X/></button><img src={active.logo_url} alt={active.name}/><div><small>PATROCINADOR OFICIAL</small><h3>{active.name}</h3><p>{active.description||"Este patrocinador apoya las actividades deportivas y la organización de carreras junto a Nesport."}</p></div></article></div>}</section>;
}
