"use client";

import { Organization } from "@/lib/types";
import { differenceInDays, parseISO } from "date-fns";
import Link from "next/link";

interface Props {
  organization: Organization | null;
}

export default function LicenseBanner({ organization }: Props) {
  if (!organization || !organization.license_expires_at) return null;

  const expiry = parseISO(organization.license_expires_at);
  const now = new Date();
  const daysLeft = differenceInDays(expiry, now);

  // Only show if expiring in 5 days or already expired
  if (daysLeft > 5) return null;

  const isExpired = daysLeft < 0;

  return (
    <div className={`w-full py-2 px-6 flex items-center justify-center gap-4 text-xs font-bold transition-all ${
      isExpired 
        ? "bg-red-600 text-white animate-pulse" 
        : "bg-amber-500 text-black"
    }`}>
      <span className="flex items-center gap-2">
        {isExpired ? "🚨" : "⚠️"}
        {isExpired 
          ? `Your Project Hub license for ${organization.name} has expired.`
          : `Your Project Hub license for ${organization.name} expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}.`
        }
      </span>
      
      <Link 
        href="mailto:admin@avel.africa?subject=License Renewal Request - ${organization.name}"
        className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-widest font-black transition-all ${
          isExpired 
            ? "border-white hover:bg-white hover:text-red-600" 
            : "border-black/20 hover:bg-black hover:text-amber-500"
        }`}
      >
        Contact Admin for Renewal
      </Link>
    </div>
  );
}
