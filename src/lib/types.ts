export type CustomerType = "ofw" | "local";

export type DealStage =
  | "qualified"
  | "pitched"
  | "closed"
  | "follow_up"
  | "no_interest"
  | "in_consultation"
  | "hot_lead"
  | "new_lead"
  | "high_intent";

export type ManagementStyle = "hands_on" | "family_managed" | "semi_passive";

export interface FranchiseBrand {
  brandId: string;
  brandName: string;
  category: string;
  capitalMin: number;
  capitalMax: number;
  trendSignal: string;
  locationSignal: string;
  riskSignal: string;
  salesPitch: string;
  strongProvinces: string[];
  trending: boolean;
  paybackEstimate: string;
  managementStyle: ManagementStyle;
}

export interface LeadRecord {
  leadId: string;
  investorName: string;
  email: string;
  phone: string;
  customerType: CustomerType;
  customerLabel: string;
  budgetText: string;
  budgetValue: number;
  preferredIndustry: string;
  targetLocation: string;
  aiScore: number;
  scoreLabel: string;
  stage: DealStage;
  lastActivity: string;
  channel: string;
  actionLabel: string;
  recommendedBrand: string;
  recommendationReason: string;
  marketSignal: string;
  managementStyle: ManagementStyle;
  timeline: string;
  riskFlags: string[];
  transcriptPreview: string[];
}

export interface DashboardStat {
  label: string;
  value: string;
  subtext: string;
  tone: "neutral" | "success" | "gold" | "navy";
}

export interface PackageInterest {
  label: string;
  percent: number;
  tone: "navy" | "gold" | "slate" | "green";
}
