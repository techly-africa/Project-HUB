import { getDocuments, getFolders, getTaskAttachmentsWithContext } from "@/lib/queries";
import DocumentRepository from "@/components/DocumentRepository";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const [documents, folders, taskAttachments] = await Promise.all([
    getDocuments(),
    getFolders(),
    getTaskAttachmentsWithContext(),
  ]);

  return (
    <DocumentRepository
      initialDocuments={documents}
      initialFolders={folders}
      taskAttachments={taskAttachments}
    />
  );
}
