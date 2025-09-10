
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Trash2,
  UserPlus,
  UserMinus,
  RefreshCcw,
  Shield,
  Users,
  Key,
  Lock,
  FolderPlus,
  CircleArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import quantumCryptographyModule from '@/lib/quantum/QuantumCryptographyModule';
import { HierarchicalGroup, KeyRotationPolicy } from '@/lib/quantum/types';

export function HierarchicalGroups() {
  const [groups, setGroups] = useState<HierarchicalGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('groups');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  
  // Form states
  const [groupName, setGroupName] = useState('');
  const [adminIds, setAdminIds] = useState('');
  const [memberIds, setMemberIds] = useState('');
  const [parentGroup, setParentGroup] = useState('');
  const [keyRotationInterval, setKeyRotationInterval] = useState(24);
  const [rotateOnMembershipChange, setRotateOnMembershipChange] = useState(true);
  const [rotateOnSecurityEvent, setRotateOnSecurityEvent] = useState(true);
  const [minimumEntropy, setMinimumEntropy] = useState(0.8);
  
  // Add member form
  const [newMemberIds, setNewMemberIds] = useState('');
  const [addAsAdmin, setAddAsAdmin] = useState(false);
  
  // Message encryption
  const [messageToEncrypt, setMessageToEncrypt] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [messageToDecrypt, setMessageToDecrypt] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  
  // Load groups on component mount
  useEffect(() => {
    loadGroups();
  }, []);
  
  const loadGroups = () => {
    try {
      const groupList = quantumCryptographyModule.listGroups();
      setGroups(groupList);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load quantum groups');
    }
  };
  
  // Create a new hierarchical group
  const createGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    
    if (!adminIds.trim()) {
      toast.error('Please enter at least one admin ID');
      return;
    }
    
    setIsCreatingGroup(true);
    
    try {
      // Parse IDs
      const adminIdArray = adminIds.split(',').map(id => id.trim());
      
      // Create key rotation policy
      const keyRotationPolicy: KeyRotationPolicy = {
        intervalHours: keyRotationInterval,
        lastRotation: Date.now(),
        autoRotate: true,
        rotationConditions: {
          participantJoin: rotateOnMembershipChange,
          participantLeave: rotateOnMembershipChange,
          suspectedCompromise: rotateOnSecurityEvent
        },
        // Add backward compatibility properties
        intervalMs: keyRotationInterval * 60 * 60 * 1000, // Convert hours to ms
        onMembershipChange: rotateOnMembershipChange,
        onSecurityEvent: rotateOnSecurityEvent,
        minimumEntropy: minimumEntropy
      };
      
      // Create the group - Fix: pass only required arguments
      const group = await quantumCryptographyModule.createHierarchicalGroup(
        groupName,
        adminIdArray[0], // Use first admin ID as primary admin
        keyRotationPolicy
      );
      
      // Refresh groups
      loadGroups();
      
      // Select the new group
      setSelectedGroup(group.id);
      
      // Reset form
      setGroupName('');
      setAdminIds('');
      setMemberIds('');
      setParentGroup('');
      
      toast.success('Quantum-secured hierarchical group created successfully');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setIsCreatingGroup(false);
    }
  };
  
  // Add members to a group
  const addMembers = async () => {
    if (!selectedGroup) {
      toast.error('Please select a group');
      return;
    }
    
    if (!newMemberIds.trim()) {
      toast.error('Please enter at least one member ID');
      return;
    }
    
    setIsAddingMembers(true);
    
    try {
      // Parse member IDs
      const memberIdArray = newMemberIds.split(',').map(id => id.trim());
      
      // Add members to group
      await quantumCryptographyModule.addGroupMembers(
        selectedGroup,
        memberIdArray,
        addAsAdmin
      );
      
      // Refresh groups
      loadGroups();
      
      // Reset form
      setNewMemberIds('');
      setAddAsAdmin(false);
      
      toast.success(`Members added to group ${getSelectedGroup()?.name}`);
    } catch (error) {
      console.error('Error adding members:', error);
      toast.error('Failed to add members');
    } finally {
      setIsAddingMembers(false);
    }
  };
  
  // Remove a member from a group
  const removeMember = async (memberId: string) => {
    if (!selectedGroup) return;
    
    try {
      await quantumCryptographyModule.removeGroupMembers(
        selectedGroup,
        [memberId]
      );
      
      // Refresh groups
      loadGroups();
      
      toast.success(`Member removed from group ${getSelectedGroup()?.name}`);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };
  
  // Rotate group key
  const rotateGroupKey = async () => {
    if (!selectedGroup) {
      toast.error('Please select a group');
      return;
    }
    
    setIsRotatingKey(true);
    
    try {
      await quantumCryptographyModule.rotateGroupKey(
        selectedGroup,
        'manual'
      );
      
      // Refresh groups
      loadGroups();
      
      toast.success(`Key rotated for group ${getSelectedGroup()?.name}`);
    } catch (error) {
      console.error('Error rotating key:', error);
      toast.error('Failed to rotate key');
    } finally {
      setIsRotatingKey(false);
    }
  };
  
  // Encrypt a message for a group
  const encryptMessage = async () => {
    if (!selectedGroup || !messageToEncrypt.trim()) {
      toast.error('Please select a group and enter a message');
      return;
    }
    
    try {
      const encrypted = await quantumCryptographyModule.encryptForGroup(
        selectedGroup,
        messageToEncrypt
      );
      
      setEncryptedMessage(encrypted);
      toast.success('Message encrypted successfully');
    } catch (error) {
      console.error('Error encrypting message:', error);
      toast.error('Failed to encrypt message');
    }
  };
  
  // Decrypt a message from a group
  const decryptMessage = async () => {
    if (!selectedGroup || !messageToDecrypt.trim()) {
      toast.error('Please select a group and enter an encrypted message');
      return;
    }
    
    try {
      const decrypted = await quantumCryptographyModule.decryptFromGroup(
        selectedGroup,
        messageToDecrypt
      );
      
      setDecryptedMessage(decrypted);
      toast.success('Message decrypted successfully');
    } catch (error) {
      console.error('Error decrypting message:', error);
      toast.error('Failed to decrypt message');
    }
  };
  
  // Get selected group
  const getSelectedGroup = () => {
    if (!selectedGroup) return null;
    return groups.find(group => group.id === selectedGroup) || null;
  };
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Calculate time until next key rotation
  const getTimeUntilNextRotation = (group: HierarchicalGroup) => {
    const nextRotation = group.lastKeyRotation + ((group.keyRotationPolicy.intervalMs || group.keyRotationPolicy.intervalHours * 3600000));
    const timeUntilNextRotation = nextRotation - Date.now();
    
    if (timeUntilNextRotation <= 0) {
      return 'Due now';
    }
    
    const hours = Math.floor(timeUntilNextRotation / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilNextRotation % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            <span>Hierarchical Quantum Groups</span>
          </CardTitle>
          
          <Button 
            onClick={() => loadGroups()} 
            variant="outline"
            className="border-purple-500/30"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="groups" className="data-[state=active]:bg-purple-600">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-600">
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Group
            </TabsTrigger>
            <TabsTrigger value="messaging" className="data-[state=active]:bg-purple-600">
              <Lock className="h-4 w-4 mr-2" />
              Secure Messaging
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="groups" className="space-y-4">
            {/* Group List */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Quantum-Secured Groups</h3>
              
              {groups.length === 0 ? (
                <div className="text-center py-6 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400">No groups created yet</p>
                  <Button 
                    onClick={() => setActiveTab('create')} 
                    className="mt-3 bg-purple-600 hover:bg-purple-700"
                  >
                    Create Your First Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div 
                      key={group.groupId}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedGroup === group.groupId 
                          ? 'bg-purple-900/20 border border-purple-500/30' 
                          : 'bg-gray-800/50 hover:bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedGroup(group.groupId)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{group.name}</span>
                        {group.parentGroupId && (
                          <Badge className="bg-blue-600">
                            <CircleArrowDown className="h-3 w-3 mr-1" /> Subgroup
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                        <div className="flex justify-between text-gray-400">
                          <span>Admins:</span>
                          <span>{group.adminIds.length}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Members:</span>
                          <span>{group.memberIds.length}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Created:</span>
                          <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Next Rotation:</span>
                          <span>{getTimeUntilNextRotation(group)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selected Group Details */}
            {selectedGroup && (
              <div className="bg-gray-900/50 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{getSelectedGroup()?.name} Details</h3>
                  <Button
                    onClick={rotateGroupKey}
                    disabled={isRotatingKey}
                    className="bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    {isRotatingKey ? (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                        Rotating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Rotate Key
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Group Info */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-400 mb-2">Group Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID:</span>
                        <span className="font-mono">{getSelectedGroup()?.groupId.substring(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span>{formatTime(getSelectedGroup()?.createdAt || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Key Rotation:</span>
                        <span>{formatTime(getSelectedGroup()?.lastKeyRotation || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rotation Interval:</span>
                        <span>{(getSelectedGroup()?.keyRotationPolicy.intervalMs || 0) / (1000 * 60 * 60)} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rotate on Membership Change:</span>
                        <span>{getSelectedGroup()?.keyRotationPolicy.onMembershipChange ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Add Members */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-400 mb-2">Add Members</h4>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="newMemberIds">Member IDs (comma-separated)</Label>
                        <Input
                          id="newMemberIds"
                          value={newMemberIds}
                          onChange={(e) => setNewMemberIds(e.target.value)}
                          placeholder="member1, member2, ..."
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="addAsAdmin" 
                          checked={addAsAdmin}
                          onCheckedChange={(checked) => setAddAsAdmin(checked === true)}
                        />
                        <Label htmlFor="addAsAdmin">Add as admin</Label>
                      </div>
                      <Button 
                        onClick={addMembers}
                        disabled={isAddingMembers || !newMemberIds.trim()}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        {isAddingMembers ? 'Adding...' : 'Add Members'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Members List */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Group Members</h4>
                  <div className="bg-gray-800/50 rounded-lg p-2 max-h-40 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400">
                          <th className="pb-2">ID</th>
                          <th className="pb-2">Role</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {getSelectedGroup()?.adminIds.map((adminId) => (
                          <tr key={`admin-${adminId}`} className="hover:bg-gray-700/30">
                            <td className="py-1.5 font-mono">{adminId}</td>
                            <td className="py-1.5">
                              <Badge className="bg-purple-600">Admin</Badge>
                            </td>
                            <td className="py-1.5 text-right">
                              <Button
                                onClick={() => removeMember(adminId)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {getSelectedGroup()?.memberIds.map((memberId) => (
                          <tr key={`member-${memberId}`} className="hover:bg-gray-700/30">
                            <td className="py-1.5 font-mono">{memberId}</td>
                            <td className="py-1.5">
                              <Badge variant="outline" className="border-gray-600">Member</Badge>
                            </td>
                            <td className="py-1.5 text-right">
                              <Button
                                onClick={() => removeMember(memberId)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="create" className="space-y-4">
            {/* Create Group Form */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Create Hierarchical Quantum Group</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div>
                  <Label htmlFor="adminIds">Admin IDs (comma-separated)</Label>
                  <Input
                    id="adminIds"
                    value={adminIds}
                    onChange={(e) => setAdminIds(e.target.value)}
                    placeholder="admin1, admin2, ..."
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div>
                  <Label htmlFor="memberIds">Member IDs (comma-separated, optional)</Label>
                  <Input
                    id="memberIds"
                    value={memberIds}
                    onChange={(e) => setMemberIds(e.target.value)}
                    placeholder="member1, member2, ..."
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div>
                  <Label htmlFor="parentGroup">Parent Group (optional)</Label>
                  <select
                    id="parentGroup"
                    value={parentGroup}
                    onChange={(e) => setParentGroup(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                  >
                    <option value="">-- No Parent Group --</option>
                    {groups.map((group) => (
                      <option key={group.groupId} value={group.groupId}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-400 mb-3">Key Rotation Policy</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="keyRotationInterval">Rotation Interval (hours)</Label>
                      <Input
                        id="keyRotationInterval"
                        type="number"
                        min={1}
                        value={keyRotationInterval}
                        onChange={(e) => setKeyRotationInterval(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="rotateOnMembershipChange" 
                        checked={rotateOnMembershipChange}
                        onCheckedChange={setRotateOnMembershipChange}
                      />
                      <Label htmlFor="rotateOnMembershipChange">Rotate keys on membership change</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="rotateOnSecurityEvent" 
                        checked={rotateOnSecurityEvent}
                        onCheckedChange={setRotateOnSecurityEvent}
                      />
                      <Label htmlFor="rotateOnSecurityEvent">Rotate keys on security events</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="minimumEntropy">Minimum Entropy (0-1)</Label>
                      <Input
                        id="minimumEntropy"
                        type="number"
                        min={0}
                        max={1}
                        step={0.1}
                        value={minimumEntropy}
                        onChange={(e) => setMinimumEntropy(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={createGroup}
                  disabled={isCreatingGroup || !groupName.trim() || !adminIds.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isCreatingGroup ? 'Creating...' : 'Create Quantum Group'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="messaging" className="space-y-4">
            {/* Secure Messaging */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Quantum-Secured Group Messaging</h3>
              
              {groups.length === 0 ? (
                <div className="text-center py-6 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400">No groups created yet</p>
                  <Button 
                    onClick={() => setActiveTab('create')} 
                    className="mt-3 bg-purple-600 hover:bg-purple-700"
                  >
                    Create a Group First
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="selectedMessageGroup">Select Group</Label>
                    <select
                      id="selectedMessageGroup"
                      value={selectedGroup || ''}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                    >
                      <option value="">-- Select a group --</option>
                      {groups.map((group) => (
                        <option key={group.groupId} value={group.groupId}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Encryption */}
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-purple-400 mb-2">Encrypt Message</h4>
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="messageToEncrypt">Message to Encrypt</Label>
                          <textarea
                            id="messageToEncrypt"
                            value={messageToEncrypt}
                            onChange={(e) => setMessageToEncrypt(e.target.value)}
                            placeholder="Enter message to encrypt"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white h-24"
                          />
                        </div>
                        
                        <Button
                          onClick={encryptMessage}
                          disabled={!selectedGroup || !messageToEncrypt.trim()}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          Encrypt with Quantum Key
                        </Button>
                        
                        {encryptedMessage && (
                          <div className="mt-2">
                            <Label>Encrypted Message</Label>
                            <div className="bg-gray-900 p-2 rounded font-mono text-xs break-all max-h-24 overflow-y-auto">
                              {encryptedMessage}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Decryption */}
                    <div className="bg-gray-800/50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-purple-400 mb-2">Decrypt Message</h4>
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="messageToDecrypt">Encrypted Message</Label>
                          <textarea
                            id="messageToDecrypt"
                            value={messageToDecrypt}
                            onChange={(e) => setMessageToDecrypt(e.target.value)}
                            placeholder="Enter encrypted message"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white h-24"
                          />
                        </div>
                        
                        <Button
                          onClick={decryptMessage}
                          disabled={!selectedGroup || !messageToDecrypt.trim()}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          Decrypt with Quantum Key
                        </Button>
                        
                        {decryptedMessage && (
                          <div className="mt-2">
                            <Label>Decrypted Message</Label>
                            <div className="bg-gray-900 p-2 rounded text-sm max-h-24 overflow-y-auto">
                              {decryptedMessage}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
