
/**
 * Mock IPFS service for workflow data storage
 */
export class IPFSService {
  private static instance: IPFSService;
  private storage: Map<string, any> = new Map();
  
  private constructor() {}
  
  static getInstance(): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService();
    }
    return IPFSService.instance;
  }
  
  /**
   * Store data on IPFS (mock)
   */
  async storeData(data: any): Promise<string> {
    const cid = `ipfs-${Date.now()}-${Math.round(Math.random() * 1000000)}`;
    this.storage.set(cid, JSON.stringify(data));
    return cid;
  }
  
  /**
   * Retrieve data from IPFS (mock)
   */
  async retrieveData(cid: string): Promise<any> {
    const data = this.storage.get(cid);
    if (!data) {
      throw new Error(`Data not found for CID: ${cid}`);
    }
    return JSON.parse(data);
  }
  
  /**
   * Check if a CID exists
   */
  async exists(cid: string): Promise<boolean> {
    return this.storage.has(cid);
  }
}

export const ipfsService = IPFSService.getInstance();
export default ipfsService;
