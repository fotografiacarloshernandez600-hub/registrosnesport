"use client";
import { useState } from "react";
import { Maximize2, X } from "lucide-react";
export type KitItem = { image: string | null; name: string };
export default function KitShowcase({ items }: { items: KitItem[] }) {
  const [active, setActive] = useState<KitItem | null>(null);
  return <>
    <div className="kit-showcase media-kit">
      {items.map((item) => <button type="button" key={item.name} className="kit-product" onClick={() => item.image && setActive(item)} disabled={!item.image} aria-label={`Ver imagen completa: ${item.name}`}>
        <span className="kit-image-frame">{item.image ? <img src={item.image} alt={item.name} loading="lazy" /> : <span className="kit-placeholder">Nesport</span>}<i><Maximize2 size={17}/></i></span>
        <b>{item.name}</b><small>{item.image ? "Toca para ampliar" : "Imagen por agregar"}</small>
      </button>)}
    </div>
    {active?.image && <div className="lightbox kit-lightbox" onMouseDown={() => setActive(null)}><article onMouseDown={e => e.stopPropagation()}><button type="button" aria-label="Cerrar imagen" onClick={() => setActive(null)}><X/></button><img src={active.image} alt={active.name}/><div><small>DETALLE DEL KIT</small><h3>{active.name}</h3><p>Imagen oficial de la carrera.</p></div></article></div>}
  </>;
}
