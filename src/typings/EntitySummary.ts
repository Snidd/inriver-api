export interface EntitySummary {
  id: number;
  displayName: string;
  displayDescription: string;
  version: string;
  lockedBy: string | null;
  createdBy: string;
  createdDate: string;
  formattedCreatedDate: string;
  modifiedBy: string;
  modifiedDate: string;
  formattedModifiedDate: string;
  resourceUrl: string | null;
  entityTypeId: string;
  entityTypeDisplayName: string;
  completeness: string | null;
  fieldSetId: string | null;
  fieldSetName: string | null;
  segmentId: number;
  segmentName: string;
}
