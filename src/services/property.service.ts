import { Property } from "@/types";

export class PropertyService {
  static getPropertyByZpid(zpid: string, properties: Property[]): Property | undefined {
    return properties.find((p) => p.zpid === zpid);
  }
}
