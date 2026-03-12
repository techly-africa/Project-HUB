import { getPlanByType } from "@/lib/queries";
import PlanView from "@/components/PlanView";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: { type: string };
}

import { PlanType } from "@/lib/types";

export default async function PlanPage({ params }: Props) {
  const validTypes: PlanType[] = ["product-tech", "legal", "biz-dev"];
  if (!validTypes.includes(params.type as any)) notFound();

  const plan = await getPlanByType(params.type as any);
  return <PlanView plan={plan} />;
}

export function generateStaticParams() {
  return [{ type: "product-tech" }, { type: "legal" }, { type: "biz-dev" }];
}
