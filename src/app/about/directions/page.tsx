import HowToGetHere from "@/components/HowToGetHere";

export const metadata = {
  title: "How to Get Here | Hidden Paradise Nature Park",
  description:
    "Directions to Hidden Paradise Nature Park on Akuse Road, Okwenya. About an hour east of Accra. Self-drive, bus, or airport transfer options.",
};

export default function DirectionsPage() {
  return (
    <main className="pt-28 pb-24">
      <HowToGetHere />
    </main>
  );
}
