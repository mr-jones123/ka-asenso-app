"use client";

import { useEffect, useState } from "react";
import LeadsTable from "@/components/leads/LeadsTable";
import type { LeadRecord } from "@/lib/types";

interface LeadsTableClientProps {
  initialLeads: LeadRecord[];
}

export default function LeadsTableClient({ initialLeads }: LeadsTableClientProps) {
  const [leads, setLeads] = useState<LeadRecord[]>(initialLeads);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/leads", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { leads: LeadRecord[] };
        if (active) setLeads(json.leads);
      } catch {
        // ignore
      }
    }
    load();
    const id = window.setInterval(load, 5000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  return <LeadsTable leads={leads} />;
}
