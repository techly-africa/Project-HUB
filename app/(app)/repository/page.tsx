import { getDocuments, getTaskAttachmentsWithContext } from "@/lib/queries";
import DocumentRepository from "@/components/DocumentRepository";

export default async function RepositoryPage() {
  const [documents, taskAttachments] = await Promise.all([
    getDocuments(),
    getTaskAttachmentsWithContext(),
  ]);

  return <DocumentRepository initialDocuments={documents} taskAttachments={taskAttachments} />;
}
