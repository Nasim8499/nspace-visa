import { CareersJourney } from "@/components/CareersJourney";

export const metadata = {
  title: "Careers at Nspace Visa Agency · The Journey",
  description:
    "Open roles at Nspace. Scroll the journey: our mission, our reach, the five things we actually mean, and every team hiring right now.",
};

export default function Careers() {
  return (
    <div className="-mt-px">
      <CareersJourney />
    </div>
  );
}
