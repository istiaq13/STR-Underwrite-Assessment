import { Market, Property } from "@/types";
import { INITIAL_MARKETS, INITIAL_PROPERTIES } from "@/lib/mockData";

export class PropertyService {
  static getMarkets(): Market[] {
    return INITIAL_MARKETS;
  }

  static getProperties(): Property[] {
    return INITIAL_PROPERTIES;
  }

  static getPropertyByZpid(zpid: string, properties: Property[]): Property | undefined {
    return properties.find((p) => p.zpid === zpid);
  }
}
