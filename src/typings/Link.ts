export interface Link {
  id: number;
  isActive: boolean;
  linkTypeId: string;
  sourceEntityId: number;
  targetEntityId: number;
  linkEntityId: null;
  index: number;
}
