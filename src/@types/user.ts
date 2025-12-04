export interface User {
  id: string;
  name: string;
  account?: string;
  acl: string[];
  meta: UserMeta;
}


export interface UserMeta {
  assetTypes: string[];
  similarAssetFields: string[];
  // add more if needed
}