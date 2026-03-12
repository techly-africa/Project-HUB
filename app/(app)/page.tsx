import { getPlanWithStats } from "@/lib/queries";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [productTech, legal, bizDev] = await Promise.all([
    getPlanWithStats("product-tech"),
    getPlanWithStats("legal"),
    getPlanWithStats("biz-dev"),
  ]);
  return <Dashboard
    productTechPlan={productTech}
    legalPlan={legal}
    bizDevPlan={bizDev}
  />;
}
