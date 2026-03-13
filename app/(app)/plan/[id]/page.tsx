import { getPlanById } from "@/lib/queries";
import PlanView from "@/components/PlanView";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function PlanPage({ params }: Props) {
  const plan = await getPlanById(params.id);
  return <PlanView plan={plan} />;
}
