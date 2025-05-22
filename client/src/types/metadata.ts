export enum MetadataAttributeType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  URL = 'url'
}

export interface MetadataAttribute {
  trait_type: string;
  value: string | number | boolean;
  type?: MetadataAttributeType;
  display_type?: string;
}

export interface ProfileMetadata {
  name?: string;
  bio?: string;
  attributes?: MetadataAttribute[];
  version?: string;
  metadata_id?: string;
} 