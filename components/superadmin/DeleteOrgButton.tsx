"use client";

import { useTransition } from "react";
import { deleteOrgAction } from "@/app/actions/superadmin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeleteOrgButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`CRITICAL: Are you sure you want to delete ${name}?\n\nThis will disconnect all members and remove all associated projects. This action CANNOT be undone.`)) return;
    
    startTransition(async () => {
      try {
        await deleteOrgAction(id);
        toast.success(`Organization ${name} deleted`);
        router.push("/superadmin/organizations");
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {isPending ? (
        <div className="w-3.5 h-3.5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      ) : (
        "Delete Organization"
      )}
    </button>
  );
}
