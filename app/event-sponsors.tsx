"use client";
import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
type Sponsor = { id: string; name: string; logo_url: string; description?: string | null; sort_order: number };
export default function EventSponsors({ sponsors }: { sponsors: Sponsor[] }) {
 const [active,setActive]=useState<Sponsor|null>(null);
 return <><div className="sponsor-logo-grid">{[...sponsors].sort((a,b)=>a.sort_order-b.sort_order).map(s=><button type="button" key={s.id} className="sponsor-card-button" onClick={()=>setActive(s)}><span className="sponsor-card-logo"><img src={s.logo_url} alt={s.name}/></span><b>{s.name}</b><small>Conoce al patrocinador <ExternalLink size={13}/></small></button>)}</div>{active&&<div className="lightbox sponsor-lightbox" onMouseDown={()=>setActive(null)}><article onMouseDown={e=>e.stopPropagation()}><button type="button" aria-label="Cerrar" onClick={()=>setActive(null)}><X/></button><img src={active.logo_url} alt={active.name}/><div className="sponsor-detail-content"><small>PATROCINADOR OFICIAL</small><h3>{active.name}</h3><div className="sponsor-description-scroll" tabIndex={0} role="region" aria-label={`Descripción de ${active.name}`}><p>{active.description||"Este patrocinador forma parte de los aliados que hacen posible la experiencia de esta carrera."}</p></div></div></article></div>}</>;
}
