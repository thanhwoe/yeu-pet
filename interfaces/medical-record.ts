export interface IMedicalRecord {
  id: string;
  attachmentStatus: "processing" | "ready" | "failed";
  petId: string;
  recordType: "vaccination" | "checkup" | "surgery" | "medication";
  title: string;
  description: string | null;
  date: string;
  vetClinic: string | null;
  vetName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface IMedicalAttachment {
  id: string;
  medicalId: string;
  deletedAt: string | null;
  url: string;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMedicalRecordDetail extends IMedicalRecord {
  medicalAttachments: IMedicalAttachment[];
}
