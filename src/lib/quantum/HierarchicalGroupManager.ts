
import { HierarchicalGroup, KeyRotationPolicy } from './types';
import { BaseQuantumCrypto } from './BaseQuantumCrypto';
import { realTimeQuantumProcessor } from './RealTimeQuantumProcessor';

export class HierarchicalGroupManager extends BaseQuantumCrypto {
  private groups: Record<string, HierarchicalGroup> = {};

  async createHierarchicalGroup(
    name: string,
    adminId: string,
    keyRotationPolicy: KeyRotationPolicy
  ): Promise<HierarchicalGroup> {
    const task = await this.submitQuantumTask('keyDistribution', {
      operation: 'generate-quantum-key',
      keyLength: 256
    });
    
    // Use the whole task object or create a task ID if needed
    const taskId = task.id || this.generateUUID();
    
    // Use the processor directly or simulate a result
    const result = await this.simulateTaskResult(taskId);
    
    const id = this.generateUUID();
    const groupKey = result.key || result.keyHex;
    
    const group: HierarchicalGroup = {
      id,
      groupId: id, // For backward compatibility
      name,
      level: 0,
      childrenIds: [],
      participants: [adminId],
      adminIds: [adminId],
      memberIds: [adminId],
      createdAt: Date.now(),
      keyRotationPolicy,
      previousKeyIds: [],
      lastKeyRotation: Date.now(),
      encryptedGroupKey: groupKey,
      subgroups: []
    };
    
    this.groups[id] = group;
    
    return group;
  }

  async addMemberToGroup(groupId: string, memberId: string, adminId: string): Promise<boolean> {
    const group = this.getGroup(groupId);
    
    if (!group) {
      throw new Error(`Group with id ${groupId} not found`);
    }
    
    if (!group.adminIds.includes(adminId)) {
      throw new Error('Only admins can add members to a group');
    }
    
    if (group.memberIds.includes(memberId)) {
      return true; // Member already in group
    }
    
    // Add the member
    group.memberIds.push(memberId);
    group.participants.push(memberId);
    
    // If the policy requires, rotate key on membership change
    if (group.keyRotationPolicy.onMembershipChange) {
      await this.rotateGroupKey(groupId, adminId, 'membership-change');
    }
    
    return true;
  }

  async removeMemberFromGroup(groupId: string, memberId: string): Promise<boolean> {
    const group = this.getGroup(groupId);
    
    if (!group) {
      throw new Error(`Group with id ${groupId} not found`);
    }
    
    const memberIndex = group.memberIds.indexOf(memberId);
    if (memberIndex === -1) {
      return false; // Member not in group
    }
    
    // Remove the member
    group.memberIds.splice(memberIndex, 1);
    
    // Also remove from participants list if present
    const participantIndex = group.participants.indexOf(memberId);
    if (participantIndex !== -1) {
      group.participants.splice(participantIndex, 1);
    }
    
    // If the member was also an admin, remove from adminIds too
    const adminIndex = group.adminIds.indexOf(memberId);
    if (adminIndex !== -1) {
      group.adminIds.splice(adminIndex, 1);
    }
    
    return true;
  }

  async rotateGroupKey(groupId: string, adminId: string, reason: 'scheduled' | 'membership-change' | 'security-event' | 'manual' | 'parent-rotation'): Promise<string> {
    const group = this.getGroup(groupId);
    
    if (!group) {
      throw new Error(`Group with id ${groupId} not found`);
    }
    
    if (!group.adminIds.includes(adminId)) {
      throw new Error('Only admins can rotate group keys');
    }
    
    const task = await this.submitQuantumTask('keyDistribution', {
      operation: 'generate-quantum-key',
      keyLength: 256
    });
    
    // Use the whole task object or create a task ID if needed
    const taskId = task.id || this.generateUUID();
    
    // Use the processor directly or simulate a result
    const result = await this.simulateTaskResult(taskId);
    
    const newGroupKey = result.key || result.keyHex;
    
    // Store the old key in previousKeyIds if it exists
    if (group.encryptedGroupKey) {
      if (!group.previousKeyIds) {
        group.previousKeyIds = [];
      }
      group.previousKeyIds.push(group.encryptedGroupKey);
    }
    
    group.encryptedGroupKey = newGroupKey;
    group.lastKeyRotation = Date.now();
    
    // Also rotate keys for all subgroups if reason is security-event
    if (reason === 'security-event' && group.subgroups && group.subgroups.length > 0) {
      for (const subgroup of group.subgroups) {
        await this.rotateGroupKey(subgroup.groupId || subgroup.id, adminId, 'parent-rotation');
      }
    }
    
    return newGroupKey;
  }

  getGroup(groupId: string): HierarchicalGroup | null {
    return this.groups[groupId] || null;
  }

  listGroups(): HierarchicalGroup[] {
    return Object.values(this.groups);
  }
  
  // Helper method to simulate task results
  private async simulateTaskResult(taskId: string): Promise<any> {
    // This method simulates getting a result from a quantum task
    return {
      keyHex: `quantum-key-${taskId.substring(0, 8)}`,
      keyLength: 256,
      success: true
    };
  }
}
