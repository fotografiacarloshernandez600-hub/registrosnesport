"use client";
import { useState } from "react";
import { Camera, CheckCircle2, Upload } from "lucide-react";

type EventPhoto = { id: string; participant_name: string; caption: string | null; image_url: string; created_at?: string };

export default function EventPhotoGallery({ eventId, eventTitle, initialPhotos }: { eventId: string; eventTitle: string; initialPhotos: EventPhoto[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const formElement = e.currentTarget;
      const form = new FormData(formElement);
      form.set("eventId", eventId);
      const response = await fetch("/api/event-photos", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo enviar la foto.");
      formElement.reset();
      setNotice("¡Gracias por compartir tu momento! La fotografía quedó pendiente de revisión y aparecerá cuando Nesport la apruebe.");
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo enviar la fotografía."); }
    finally { setBusy(false); }
  }
  return <section className="participant-photos-section" id="fotos-participantes">
    <div className="participant-photos-heading"><span>COMUNIDAD NESPORT</span><h2>La carrera desde tu mirada</h2><p>La carrera ya terminó: comparte tu foto favorita de {eventTitle}. Solo corredores registrados y con pago aprobado pueden participar; todas las imágenes se revisan antes de publicarse.</p></div>
    <form className="participant-photo-form" onSubmit={submit}>
      <label>Tu nombre<input name="participantName" required maxLength={100} placeholder="Nombre del participante"/></label>
      <label>Correo usado en tu inscripción<input name="email" required type="email" placeholder="correo@ejemplo.com"/></label>
      <label>WhatsApp usado en tu inscripción<input name="phone" required inputMode="tel" placeholder="10 dígitos"/></label>
      <label>Descripción <small>(opcional)</small><input name="caption" maxLength={240} placeholder="Ej. Mi llegada a la meta"/></label>
      <label className="participant-photo-file"><Camera/><span>Seleccionar fotografía</span><small>JPG, PNG o WebP · máximo 6 MB</small><input required name="file" type="file" accept="image/jpeg,image/png,image/webp"/></label>
      <label className="photo-consent"><input required type="checkbox" name="photoConsent" value="yes"/> Confirmo que tengo derecho a compartir esta imagen y autorizo a Nesport a publicarla si es aprobada.</label>
      <button className="btn primary" disabled={busy}>{busy ? "Enviando..." : "Compartir fotografía"} <Upload size={17}/></button>
      {notice && <p className="photo-notice"><CheckCircle2/> {notice}</p>}
      {error && <p className="form-error">{error}</p>}
    </form>
    <div className="participant-photo-grid">
      {photos.map(photo => <article key={photo.id}><img src={photo.image_url} alt={photo.caption || `Fotografía de ${photo.participant_name}`}/><div><b>{photo.participant_name}</b>{photo.caption && <p>{photo.caption}</p>}</div></article>)}
      {!photos.length && <div className="participant-photo-empty"><Camera/><b>Las primeras fotos están por llegar</b><span>La galería se habilitó después del evento. Comparte tu recuerdo y forma parte de la comunidad Nesport.</span></div>}
    </div>
  </section>;
}
