import { redirect } from "next/navigation";

// Legacy route kept so previously shared/bookmarked links keep working.
export default function LegacyJornadaDoDespertarPage(): never {
  redirect("/jornada-despertas");
}
