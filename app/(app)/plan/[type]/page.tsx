import { getPlanByType } from "@/lib/queries";
import PlanView from "@/components/PlanView";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: { type: string };
}

export default async function PlanPage({ params }: Props) {
  if (params.type !== "tech" && params.type !== "operational") notFound();

  const plan = await getPlanByType(params.type);
  return <PlanView plan={plan} />;
}

export function generateStaticParams() {
  return [{ type: "tech" }, { type: "operational" }];
}
