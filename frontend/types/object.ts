/**
 * Project Object Types
 * Типы проектов/объектов
 */

export type ObjectStatus = 'open' | 'closed';

export interface PropertyObject {
  id: string;
  userId: string;
  name: string;
  address: string;
  clientName: string;
  clientContact: string;
  status: ObjectStatus;
  contractPrice: number;
  color?: string; // Computed based on index
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateObjectInput {
  name: string;
  address: string;
  clientName: string;
  clientContact: string;
  contractPrice: number;
}

export interface UpdateObjectInput {
  name?: string;
  address?: string;
  clientName?: string;
  clientContact?: string;
  status?: ObjectStatus;
  contractPrice?: number;
}
