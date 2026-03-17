"use server";

import { revalidatePath } from "next/cache";
import { addDocument, deleteDocument, createFolder, deleteFolder, moveDocument } from "@/lib/queries";

export async function addDocumentAction(payload: {
  name: string;
  storage_path: string;
  size: number | null;
  mime_type: string | null;
  source: "direct" | "task";
  task_attachment_id?: string | null;
  folder_id?: string | null;
}) {
  const doc = await addDocument(payload);
  revalidatePath("/documents");
  return doc;
}

export async function deleteDocumentAction(id: string) {
  await deleteDocument(id);
  revalidatePath("/documents");
}

export async function createFolderAction(payload: {
  name: string;
  parent_id: string | null;
}) {
  const folder = await createFolder(payload);
  revalidatePath("/documents");
  return folder;
}

export async function deleteFolderAction(id: string) {
  await deleteFolder(id);
  revalidatePath("/documents");
}

export async function moveDocumentAction(id: string, folder_id: string | null) {
  await moveDocument(id, folder_id);
  revalidatePath("/documents");
}
