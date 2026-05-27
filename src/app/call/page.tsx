import CallConsole from "@/components/CallConsole";

export const metadata = {
  title: "Ka Asenso — Voice Session",
  description: "Talk to Ara, the Ka Asenso franchise sales agent.",
};

export default function CallPage() {
  return (
    <main className="call-page">
      <CallConsole />
    </main>
  );
}
