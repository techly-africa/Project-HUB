"use server";

import { revalidatePath } from "next/cache";
import { addDocument, deleteDocument } from "@/lib/queries";

export async function addDocumentAction(payload: {
  name: string;
  storage_path: string;
  size: number | null;
  mime_type: string | null;
  source: "direct" | "task";
  task_attachment_id?: string | null;
}) {
  const doc = await addDocument(payload);
  revalidatePath("/repository");
  return doc;
}

// storagePath is passed so the client can delete the storage object after this resolves.
// Direct uploads are removed from storage client-side; task-linked docs leave the original intact.
export async function deleteDocumentAction(id: string) {
  await deleteDocument(id);
  revalidatePath("/repository");
}
