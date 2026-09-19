import { supabaseSelect } from "./supabase";
export type EventSponsor = {
  id: string;
  name: string;
  logo_url: string;
  sort_order: number;
};
export type RaceEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  event_date: string;
  price: number;
  categories: string;
  includes: string;
  waiver: string;
  privacy: string;
  bank_name: string;
  bank_holder: string;
  bank_account: string;
  bank_clabe: string;
  status: string;
  hero_image: string | null;
  shirt_image: string | null;
  bib_image: string | null;
  medal_image: string | null;
  kit_image: string | null;
  prizes: string | null;
  faq: string | null;
  event_sponsors: EventSponsor[];
};
export async function getEvents() {
  try {
    const fields =
      "id,title,slug,description,location,event_date,price,categories,includes,waiver,privacy,bank_name,bank_holder,bank_account,bank_clabe,status,hero_image,shirt_image,bib_image,medal_image,kit_image,prizes,faq,event_sponsors(id,name,logo_url,sort_order)";
    return await supabaseSelect<RaceEvent>(
      "events",
      `select=${fields}&status=in.(published,coming_soon)&order=event_date.asc`,
    );
  } catch (error) {
    console.error("No fue posible cargar las carreras", error);
    return [];
  }
}
export async function getEvent(slug: string) {
  return (await getEvents()).find((e) => e.slug === slug) || null;
}
