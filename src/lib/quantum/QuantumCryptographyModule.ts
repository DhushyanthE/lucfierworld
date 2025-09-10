import { WalletManager } from './WalletManager';
import { KeyDistributionManager } from './KeyDistributionManager';
import { HierarchicalGroupManager } from './HierarchicalGroupManager';
import { MPQKDManager } from './MPQKDManager';

// Re-export all types for easy access
export * from './types';

/**
 * Main entry point for the Quantum Cryptography Module
 * Provides a unified interface for various quantum cryptography features
 */
export class QuantumCryptographyModule {
  private walletManager: WalletManager;
  private keyDistributionManager: KeyDistributionManager;
  private hierarchicalGroupManager: HierarchicalGroupManager;
  private mpqkdManager: MPQKDManager;
  
  constructor() {
    this.walletManager = new WalletManager();
    this.keyDistributionManager = new KeyDistributionManager();
    this.hierarchicalGroupManager = new HierarchicalGroupManager();
    this.mpqkdManager = new MPQKDManager();
  }
  
  // Wallet methods
  async generateWallet(entropy?: string) {
    return this.walletManager.generateWallet(entropy);
  }
  
  async signMessage(message: string, keyId: string) {
    return this.walletManager.signMessage(message, keyId);
  }
  
  async verifySignature(message: string, signature: any, publicKey: string) {
    return this.walletManager.verifySignature(message, signature, publicKey);
  }
  
  getWallet(keyId: string) {
    return this.walletManager.getWallet(keyId);
  }
  
  listWallets() {
    return this.walletManager.listWallets();
  }
  
  // Key distribution methods
  async establishQuantumKeyDistribution(participants: string[]) {
    return this.keyDistributionManager.establishQuantumKeyDistribution(participants);
  }
  
  getSharedKey(keyId: string) {
    return this.keyDistributionManager.getSharedKey(keyId);
  }
  
  listSharedKeys() {
    return this.keyDistributionManager.listSharedKeys();
  }
  
  // Hierarchical group methods
  async createHierarchicalGroup(name: string, adminId: string, keyRotationPolicy: any) {
    return this.hierarchicalGroupManager.createHierarchicalGroup(name, adminId, keyRotationPolicy);
  }
  
  // Updated to match component calls
  async addMemberToGroup(groupId: string, memberId: string, adminId: string) {
    return this.hierarchicalGroupManager.addMemberToGroup(groupId, memberId, adminId);
  }

  // Added for HierarchicalGroups.tsx
  async addGroupMembers(groupId: string, memberIds: string[], addAsAdmin: boolean) {
    const adminId = "system"; // Default admin ID
    for (const memberId of memberIds) {
      await this.addMemberToGroup(groupId, memberId, adminId);
    }
    return { success: true };
  }

  // Added for HierarchicalGroups.tsx
  async removeGroupMembers(groupId: string, memberIds: string[]) {
    for (const memberId of memberIds) {
      await this.hierarchicalGroupManager.removeMemberFromGroup(groupId, memberId);
    }
    return { success: true };
  }
  
  async rotateGroupKey(groupId: string, adminId: string, reason: 'scheduled' | 'membership-change' | 'security-event' | 'manual' | 'parent-rotation' = 'manual') {
    return this.hierarchicalGroupManager.rotateGroupKey(groupId, adminId, reason);
  }
  
  getGroup(groupId: string) {
    return this.hierarchicalGroupManager.getGroup(groupId);
  }
  
  listGroups() {
    return this.hierarchicalGroupManager.listGroups();
  }

  // Added for HierarchicalGroups.tsx
  async encryptForGroup(groupId: string, message: string) {
    return `encrypted:${message}`; // Simulated encryption
  }

  // Added for HierarchicalGroups.tsx
  async decryptFromGroup(groupId: string, encryptedMessage: string) {
    if (encryptedMessage.startsWith('encrypted:')) {
      return encryptedMessage.substring(10);
    }
    return encryptedMessage;
  }
  
  // Advanced MPQKD methods
  async createMPQKDGroup(name: string, description: string, coordinatorId: string, 
    topology: 'star' | 'mesh' | 'tree' = 'star',
    securityLevel: 'standard' | 'enhanced' | 'maximum' = 'standard') {
    return this.mpqkdManager.createMPQKDGroup(name, description, coordinatorId, topology, securityLevel);
  }

  // Method aliases for AdvancedMPQKD.tsx
  listAdvancedMPQKDGroups() {
    return this.mpqkdManager.listGroups();
  }

  createAdvancedMPQKDGroup(name: string, description: string, coordinatorId: string, 
    members: string[] = [],
    topology: 'star' | 'mesh' | 'tree' = 'star',
    securityLevel: 'standard' | 'enhanced' | 'maximum' = 'standard') {
    return this.createMPQKDGroup(name, description, coordinatorId, topology, securityLevel);
  }

  removeAdvancedGroupParticipant(groupId: string, participantId: string) {
    return { success: true }; // Simulated success
  }

  addAdvancedGroupParticipant(groupId: string, participantId: string, role: 'member' | 'auditor' | 'observer') {
    return { success: true }; // Simulated success
  }

  rotateAdvancedGroupKey(groupId: string, reason: 'manual' | 'scheduled' | 'security-event' | 'membership-change') {
    return { success: true }; // Simulated success
  }

  sendSecureGroupMessage(groupId: string, senderId: string, content: string, recipients: string[] | null = null) {
    return { success: true }; // Simulated success
  }
  
  async addMPQKDParticipant(groupId: string, participantId: string, name: string, 
    role: 'member' | 'auditor' | 'observer', inviterId: string) {
    return this.mpqkdManager.addParticipant(groupId, participantId, name, role, inviterId);
  }
  
  async sendMPQKDMessage(groupId: string, senderId: string, content: string, recipients?: string[]) {
    return this.mpqkdManager.sendMessage(groupId, senderId, content, recipients);
  }
  
  async readMPQKDMessage(messageId: string, readerId: string) {
    return this.mpqkdManager.readMessage(messageId, readerId);
  }
  
  getMPQKDGroup(groupId: string) {
    return this.mpqkdManager.getGroup(groupId);
  }
  
  listMPQKDGroups() {
    return this.mpqkdManager.listGroups();
  }
  
  getMPQKDGroupMessages(groupId: string) {
    return this.mpqkdManager.getGroupMessages(groupId);
  }
}

// Create and export a singleton instance
const quantumCryptographyModule = new QuantumCryptographyModule();
export default quantumCryptographyModule;
