import { notFound } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Medal,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getEvent } from "@/lib/events";
import RegistrationForm from "../../registration-form";
import EventPhotoGallery from "../../event-photo-gallery";
import KitShowcase from "../../kit-showcase";
import EventSponsors from "../../event-sponsors";
import { supabaseSelect } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export default async function RaceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    event = await getEvent(slug);
  if (!event) notFound();
  const open = event.status === "published";
  const eventHasEnded = new Date(event.event_date).getTime() + 12 * 60 * 60 * 1000 < Date.now();
  let participantPhotos: {id:string;participant_name:string;caption:string|null;image_url:string;created_at:string}[] = [];
  try {
    participantPhotos = await supabaseSelect("event_photos", `select=id,participant_name,caption,image_url,created_at&event_id=eq.${encodeURIComponent(event.id)}&status=eq.approved&order=created_at.desc&limit=100`);
  } catch {}
  const kit = [
    { image: event.shirt_image, name: "Playera oficial" },
    { image: event.medal_image, name: "Medalla Nesport" },
    { image: event.bib_image, name: "Dorsal personalizado" },
    { image: event.kit_image, name: "Kit del corredor" },
    { image: event.socks_image, name: "Calcetas oficiales" },
  ];
  return (
    <main>
      <header className="nav-shell">
        <a href="/" className="brand logo-brand">
          <img src="/nesport-logo.png" alt="Nesport" />
        </a>
        <nav>
          <a href="/">Inicio</a>
          <a href="/carreras">Carreras</a>
          <a href="/cronometro">Cronómetro</a>
        </nav>
        <a className="admin-link" href="/dashboard">
          Portal administrador
        </a>
      </header>
      <section
        className="detail-hero"
        style={
          event.hero_image
            ? {
                backgroundImage: `linear-gradient(90deg,#080a0de8,#080a0d88),url(${event.hero_image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div>
          <span>{open ? "INSCRIPCIONES ABIERTAS" : "PRÓXIMAMENTE"}</span>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <a
            className={`btn ${open ? "primary" : "ghost"}`}
            href={open ? "#inscripcion" : "#detalles"}
          >
            {open ? "Inscribirme" : "Conocer la carrera"}
          </a>
        </div>
        <aside className="event-logo-card">
          {event.event_logo ? <img src={event.event_logo} alt={`Logotipo de ${event.title}`} /> : <div className="event-logo-fallback"><Medal size={42}/><strong>{event.title}</strong></div>}
          <small>{event.location}</small>
        </aside>
      </section>
      <section id="detalles" className="detail-facts">
        <div>
          <CalendarDays />
          <small>FECHA</small>
          <b>
            {new Date(event.event_date).toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              timeZone: "America/Mexico_City",
            })}
          </b>
        </div>
        <div>
          <MapPin />
          <small>SALIDA Y META</small>
          <b>{event.location}</b>
        </div>
        <div>
          <Trophy />
          <small>CATEGORÍAS</small>
          <b>{event.categories}</b>
        </div>
        <div>
          <Sparkles />
          <small>INSCRIPCIÓN</small>
          <b>$ {event.price} MXN</b>
        </div>
      </section>
      <section className="race-story">
        <div>
          <span>LA EXPERIENCIA</span>
          <h2>Todo listo para cruzar la meta.</h2>
          <p>{event.description}</p>
          <div className="race-includes-panel"><span>LO QUE TE LLEVAS</span><h3>Tu inscripción incluye</h3><p>{event.includes}</p></div>
          {event.prizes && <div className="race-prizes-panel"><span>RECONOCEMOS TU ESFUERZO</span><h3>Premios</h3><p>{event.prizes}</p></div>}
          <div className="race-logistics-panel"><span>PLANEA TU EXPERIENCIA</span><h3>Indicaciones importantes</h3><p><b>Acceso:</b> {event.access_time || "Pendiente de confirmar"}{event.access_time ? ". Te recomendamos llegar con anticipación para evitar imprevistos o tráfico." : "."}</p><p><b>Calentamiento:</b> {event.warmup_time || "Pendiente de confirmar"}.</p><p><b>Entrega del kit:</b> {event.kit_pickup_info || "Pendiente de confirmar"}</p></div>
        </div>
        <KitShowcase items={kit} />
      </section>
      {!!event.event_sponsors?.length && (
        <section className="event-sponsors">
          <div>
            <span>ALIADOS DE LA CARRERA</span>
            <h2>Patrocinadores oficiales</h2>
            <p>Marcas que hacen posible esta experiencia deportiva.</p>
          </div>
          <EventSponsors sponsors={event.event_sponsors} />
        </section>
      )}
      {event.faq && (
        <section className="faq-section">
          <span>PREGUNTAS FRECUENTES</span>
          <h2>Todo lo que necesitas saber</h2>
          {event.faq
            .split("\n")
            .filter(Boolean)
            .map((line, i) => {
              const [q, a] = line.split("|");
              return (
                <details key={i}>
                  <summary>{q}</summary>
                  <p>
                    {a ||
                      "Consulta directamente con Nesport para más información."}
                  </p>
                </details>
              );
            })}
        </section>
      )}
      {open ? (
        <section id="inscripcion" className="registration-section">
          <div className="registration-intro">
            <span>INSCRIPCIÓN</span>
            <h2>Asegura tu lugar</h2>
            <p>
              Completa tus datos, revisa la responsiva y adjunta tu comprobante.
              Nesport validará el pago y asignará tu folio.
            </p>
            <div className="price-box">
              <small>TOTAL A TRANSFERIR</small>
              <strong>$ {event.price}</strong>
              <span>MXN</span>
            </div>
          </div>
          <RegistrationForm event={event} />
        </section>
      ) : (
        <section className="coming-banner">
          <span>PRÓXIMAMENTE</span>
          <h2>Las inscripciones aún no están abiertas.</h2>
          <a className="btn dark" href="/carreras">
            Ver carreras disponibles
          </a>
        </section>
      )}
      {eventHasEnded && <EventPhotoGallery eventId={event.id} eventTitle={event.title} initialPhotos={participantPhotos} /> }
    </main>
  );
}
