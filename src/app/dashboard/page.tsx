import TopNav from "@/components/shared/TopNav";
import DashboardStatGrid from "@/components/dashboard/DashboardStatGrid";
import RecentLeadsTable from "@/components/dashboard/RecentLeadsTable";
import GeographicIntentCard from "@/components/dashboard/GeographicIntentCard";
import PackagePerformanceCard from "@/components/dashboard/PackagePerformanceCard";
import PipelineSummary from "@/components/dashboard/PipelineSummary";
import LiveInsightsStream from "@/components/dashboard/LiveInsightsStream";
import { dashboardStats, packagePerformance } from "@/lib/mock-data";

const NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Leads", href: "/leads" },
  { label: "Franchise Builder", href: "/franchise-builder" },
];

export const metadata = {
  title: "Ka Asenso — Admin Dashboard",
  description: "Pipeline, scoring, and geographic intent for franchisor partners.",
};

export default function DashboardPage() {
  return (
    <div className="admin-shell">
      <TopNav navItems={NAV} activeHref="/dashboard" ctaLabel="Back to Customer View" ctaHref="/" />

      <main className="admin-main">
        <div className="page-shell admin-content">
          <DashboardStatGrid stats={dashboardStats} />
          <PipelineSummary />
          <div className="dashboard-split">
            <RecentLeadsTable />
            <LiveInsightsStream />
          </div>
          <div className="analytics-row">
            <GeographicIntentCard />
            <PackagePerformanceCard packages={packagePerformance} />
          </div>
        </div>
      </main>
    </div>
  );
}
