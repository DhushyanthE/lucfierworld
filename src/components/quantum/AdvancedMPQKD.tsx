import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Network, Shield, Users, Key, RefreshCw, Lock, MessageSquare, 
  CheckSquare, User, UserPlus, UserMinus, Clock, ShieldAlert
} from 'lucide-react';
import quantumCryptographyModule from '@/lib/quantum/QuantumCryptographyModule';
import {
  AdvancedMPQKDGroup,
  MPQKDParticipant,
  MPQKDKeyGenerationEvent,
  MPQKDAuditEvent,
  MPQKDMessage,
  MPQKDAccessControl
} from '@/lib/quantum/types';

export function AdvancedMPQKD() {
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState<AdvancedMPQKDGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<AdvancedMPQKDGroup | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupTopology, setNewGroupTopology] = useState<'star' | 'mesh' | 'tree'>('star');
  const [newGroupSecurity, setNewGroupSecurity] = useState<'standard' | 'enhanced' | 'maximum'>('enhanced');
  const [participantIds, setParticipantIds] = useState<string[]>(['coordinator', 'participant-1', 'participant-2']);
  
  const [messageContent, setMessageContent] = useState('');
  const [messageRecipients, setMessageRecipients] = useState<string[]>([]);
  const [sendToAllMembers, setSendToAllMembers] = useState(true);
  
  useEffect(() => {
    refreshGroups();
  }, []);
  
  // Helper function to convert MPQKDGroup to AdvancedMPQKDGroup
  const convertToAdvancedMPQKDGroup = (group: any): AdvancedMPQKDGroup => {
    return {
      ...group,
      keyHistory: group.keyHistory || [],
      auditLog: group.auditLog || [],
      createdAt: group.createdAt || Date.now(),
      description: group.description || '',
      topology: group.topology || 'star',
      coordinatorId: group.coordinatorId || (group.participants && group.participants[0]?.id) || '',
      accessControl: group.accessControl || {
        accessPolicy: 'all-members',
        rolePermissions: {},
        temporaryAccess: []
      }
    };
  };
  
  const refreshGroups = () => {
    try {
      const allGroups = quantumCryptographyModule.listAdvancedMPQKDGroups();
      // Convert each group to AdvancedMPQKDGroup type
      const advancedGroups = allGroups.map(convertToAdvancedMPQKDGroup);
      setGroups(advancedGroups);
      
      if (selectedGroup) {
        const updatedGroup = allGroups.find(g => g.id === selectedGroup.id);
        if (updatedGroup) {
          setSelectedGroup(convertToAdvancedMPQKDGroup(updatedGroup));
        }
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load quantum groups');
    }
  };
  
  const handleCreateGroup = async () => {
    if (!newGroupName) {
      toast.error('Group name is required');
      return;
    }
    
    if (participantIds.length < 2) {
      toast.error('At least two participants are required (coordinator and one member)');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const coordinator = participantIds[0];
      const members = participantIds.slice(1);
      
      const group = await quantumCryptographyModule.createAdvancedMPQKDGroup(
        newGroupName,
        newGroupDesc,
        coordinator,
        members,
        newGroupTopology,
        newGroupSecurity
      );
      
      toast.success('Quantum group created successfully');
      setIsCreatingGroup(false);
      refreshGroups();
      
      // Convert to AdvancedMPQKDGroup before setting
      setSelectedGroup(convertToAdvancedMPQKDGroup(group));
      setActiveTab('details');
      
      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupTopology('star');
      setNewGroupSecurity('enhanced');
      setParticipantIds(['coordinator', 'participant-1', 'participant-2']);
      
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create quantum group');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSelectGroup = (group: AdvancedMPQKDGroup) => {
    setSelectedGroup(group);
    setActiveTab('details');
  };
  
  const handleRemoveParticipant = (index: number) => {
    if (participantIds.length <= 2) {
      toast.error('At least two participants are required');
      return;
    }
    
    setParticipantIds(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddParticipant = () => {
    setParticipantIds(prev => [...prev, `participant-${prev.length}`]);
  };
  
  const handleRemoveGroupParticipant = async (participantId: string) => {
    if (!selectedGroup) return;
    
    setIsProcessing(true);
    
    try {
      await quantumCryptographyModule.removeAdvancedGroupParticipant(
        selectedGroup.id,
        participantId
      );
      
      toast.success('Participant removed successfully');
      refreshGroups();
      
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleAddGroupParticipant = async () => {
    if (!selectedGroup) return;
    
    const participantId = `new-participant-${Date.now().toString(36)}`;
    
    setIsProcessing(true);
    
    try {
      await quantumCryptographyModule.addAdvancedGroupParticipant(
        selectedGroup.id,
        participantId,
        'member'
      );
      
      toast.success('Participant added successfully');
      refreshGroups();
      
    } catch (error) {
      console.error('Error adding participant:', error);
      toast.error('Failed to add participant');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRotateKeys = async () => {
    if (!selectedGroup) return;
    
    setIsProcessing(true);
    
    try {
      await quantumCryptographyModule.rotateAdvancedGroupKey(
        selectedGroup.id,
        'manual'
      );
      
      toast.success('Group keys rotated successfully');
      refreshGroups();
      
    } catch (error) {
      console.error('Error rotating keys:', error);
      toast.error('Failed to rotate group keys');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!selectedGroup) return;
    if (!messageContent) {
      toast.error('Message content is required');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const senderId = selectedGroup.coordinatorId || selectedGroup.participants[0]?.id;
      const recipients = sendToAllMembers ? null : messageRecipients;
      
      await quantumCryptographyModule.sendSecureGroupMessage(
        selectedGroup.id,
        senderId,
        messageContent,
        recipients
      );
      
      toast.success('Secure message sent successfully');
      setMessageContent('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send secure message');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleToggleSendToAll = (checked: boolean) => {
    setSendToAllMembers(checked);
    if (checked) {
      setMessageRecipients([]);
    }
  };
  
  const handleSelectRecipient = (participantId: string) => {
    if (messageRecipients.includes(participantId)) {
      setMessageRecipients(prev => prev.filter(id => id !== participantId));
    } else {
      setMessageRecipients(prev => [...prev, participantId]);
    }
  };
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            <span>Advanced Multi-Party Quantum Key Distribution</span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refreshGroups()}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
            
            <Button
              onClick={() => setIsCreatingGroup(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create Group
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="groups" className="data-[state=active]:bg-purple-600">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-purple-600" disabled={!selectedGroup}>
              <Key className="h-4 w-4 mr-2" />
              Group Details
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-purple-600" disabled={!selectedGroup}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Secure Messaging
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="groups" className="space-y-4">
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No quantum groups yet. Create your first group to start.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map(group => (
                  <div 
                    key={group.id}
                    className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
                    onClick={() => handleSelectGroup(group)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium">{group.name}</h3>
                      <Badge className={
                        group.securityLevel === 'maximum' ? 'bg-purple-600' :
                        group.securityLevel === 'enhanced' ? 'bg-blue-600' :
                        'bg-green-600'
                      }>
                        {group.securityLevel}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-1">
                      {group.description || 'No description'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm">{group.participants.length} participants</span>
                      </div>
                      <div className="flex items-center">
                        <Network className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm">{group.topology}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            {selectedGroup ? (
              <>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{selectedGroup.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {selectedGroup.description || 'No description'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={
                        selectedGroup.securityLevel === 'maximum' ? 'bg-purple-600' :
                        selectedGroup.securityLevel === 'enhanced' ? 'bg-blue-600' :
                        'bg-green-600'
                      }>
                        {selectedGroup.securityLevel}
                      </Badge>
                      
                      <Badge variant="outline">
                        {selectedGroup.topology} topology
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRotateKeys}
                        disabled={isProcessing}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        {isProcessing ? 'Rotating...' : 'Rotate Keys'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Participants</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddGroupParticipant}
                      disabled={isProcessing}
                      className="flex items-center gap-1"
                    >
                      <UserPlus className="h-3 w-3" />
                      Add Participant
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedGroup.participants.map(participant => (
                      <div 
                        key={participant.id}
                        className="bg-gray-800/50 p-3 rounded-md"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{participant.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {participant.role}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                Joined {new Date(participant.joinedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          {participant.role !== 'coordinator' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveGroupParticipant(participant.id)}
                              disabled={isProcessing}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {participant.pairwiseChannels.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-700/50">
                            <div className="text-xs text-gray-400">
                              {participant.pairwiseChannels.length} secure channels established
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Key History</h4>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {selectedGroup.keyHistory.length === 0 ? (
                        <p className="text-sm text-gray-400">No key history available</p>
                      ) : (
                        selectedGroup.keyHistory.map((event, idx) => (
                          <div 
                            key={event.keyId}
                            className="bg-gray-800/50 p-3 rounded-md"
                          >
                            <div className="flex justify-between">
                              <Badge variant={idx === selectedGroup.keyHistory.length - 1 ? "default" : "outline"}>
                                {idx === selectedGroup.keyHistory.length - 1 ? 'Current' : 'Previous'}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400">Reason:</span>
                                <span className="ml-1">{event.reason}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Entropy:</span>
                                <span className="ml-1">{event.securityMetrics.entropy.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">QBER:</span>
                                <span className="ml-1">{(event.securityMetrics.qberAverage * 100).toFixed(2)}%</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Interference:</span>
                                <span className={`ml-1 ${event.securityMetrics.detectedInterference ? 'text-red-400' : 'text-green-400'}`}>
                                  {event.securityMetrics.detectedInterference ? 'Detected' : 'None'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Audit Log</h4>
                    
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                      {selectedGroup.auditLog.length === 0 ? (
                        <p className="text-sm text-gray-400">No audit logs available</p>
                      ) : (
                        selectedGroup.auditLog.slice().reverse().map((event, idx) => (
                          <div 
                            key={idx}
                            className="flex gap-3 py-2 border-b border-gray-800 last:border-0"
                          >
                            <div className="shrink-0">
                              {event.securityImpact === 'high' ? (
                                <ShieldAlert className="h-5 w-5 text-red-500" />
                              ) : event.securityImpact === 'medium' ? (
                                <ShieldAlert className="h-5 w-5 text-yellow-500" />
                              ) : event.securityImpact === 'low' ? (
                                <Shield className="h-5 w-5 text-blue-500" />
                              ) : (
                                <CheckSquare className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="text-sm">{event.details}</div>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-400">
                                  {new Date(event.timestamp).toLocaleString()}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {event.eventType}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Select a group to view details</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="messages" className="space-y-4">
            {selectedGroup ? (
              <>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Send Secure Message</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="message-content">Message</Label>
                      <Textarea
                        id="message-content"
                        placeholder="Enter your secure message..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="mt-1 bg-gray-800"
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="send-to-all"
                          checked={sendToAllMembers}
                          onCheckedChange={handleToggleSendToAll}
                        />
                        <Label htmlFor="send-to-all">Send to all group members</Label>
                      </div>
                      
                      <Button
                        onClick={handleSendMessage}
                        disabled={isProcessing || !messageContent}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isProcessing ? 'Sending...' : 'Send Secure Message'}
                      </Button>
                    </div>
                    
                    {!sendToAllMembers && (
                      <div className="pt-3 border-t border-gray-800">
                        <Label className="mb-2 block">Select Recipients</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedGroup.participants.map(participant => (
                            <div 
                              key={participant.id}
                              className={`p-2 rounded border ${
                                messageRecipients.includes(participant.id)
                                  ? 'border-purple-500 bg-purple-900/20'
                                  : 'border-gray-700 bg-gray-800/50'
                              } cursor-pointer`}
                              onClick={() => handleSelectRecipient(participant.id)}
                            >
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{participant.name}</span>
                              </div>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {participant.role}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Security Features</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-800/50 p-3 rounded-md flex flex-col items-center text-center">
                      <Lock className="h-8 w-8 text-purple-400 mb-2" />
                      <h5 className="font-medium">End-to-End Encryption</h5>
                      <p className="text-sm text-gray-400 mt-1">
                        Messages are encrypted using quantum-resistant algorithms
                      </p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-3 rounded-md flex flex-col items-center text-center">
                      <RefreshCw className="h-8 w-8 text-purple-400 mb-2" />
                      <h5 className="font-medium">Automatic Key Rotation</h5>
                      <p className="text-sm text-gray-400 mt-1">
                        Keys are rotated automatically to maintain security
                      </p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-3 rounded-md flex flex-col items-center text-center">
                      <Shield className="h-8 w-8 text-purple-400 mb-2" />
                      <h5 className="font-medium">Eavesdropping Detection</h5>
                      <p className="text-sm text-gray-400 mt-1">
                        Any attempt to intercept communications is detected
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Select a group to access secure messaging</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
          <DialogContent className="bg-gray-900 text-white border-purple-500/20">
            <DialogHeader>
              <DialogTitle>Create Quantum Group</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="bg-gray-800"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="group-desc">Description (Optional)</Label>
                <Input
                  id="group-desc"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Enter group description"
                  className="bg-gray-800"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group-topology">Network Topology</Label>
                  <Select 
                    value={newGroupTopology} 
                    onValueChange={(v) => setNewGroupTopology(v as any)}
                  >
                    <SelectTrigger id="group-topology" className="bg-gray-800">
                      <SelectValue placeholder="Select topology" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="star">Star (Coordinator-based)</SelectItem>
                      <SelectItem value="mesh">Mesh (All-to-All)</SelectItem>
                      <SelectItem value="tree">Tree (Hierarchical)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="group-security">Security Level</Label>
                  <Select 
                    value={newGroupSecurity} 
                    onValueChange={(v) => setNewGroupSecurity(v as any)}
                  >
                    <SelectTrigger id="group-security" className="bg-gray-800">
                      <SelectValue placeholder="Select security level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (128-bit)</SelectItem>
                      <SelectItem value="enhanced">Enhanced (256-bit)</SelectItem>
                      <SelectItem value="maximum">Maximum (512-bit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Participants</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddParticipant}
                    className="h-8 flex items-center gap-1"
                  >
                    <UserPlus className="h-3 w-3" />
                    Add
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {participantIds.map((id, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 bg-gray-800 p-2 rounded"
                    >
                      <Badge variant={index === 0 ? "default" : "outline"} className="shrink-0">
                        {index === 0 ? 'Coordinator' : 'Member'}
                      </Badge>
                      <Input
                        value={id}
                        onChange={(e) => {
                          const newIds = [...participantIds];
                          newIds[index] = e.target.value;
                          setParticipantIds(newIds);
                        }}
                        className="bg-gray-700"
                        placeholder="Participant ID"
                      />
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveParticipant(index)}
                          className="h-8 w-8 p-0"
                        >
                          <UserMinus className="h-4 w-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreatingGroup(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGroup}
                disabled={isProcessing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="mt-6 bg-gray-800/30 rounded p-4 text-sm">
          <h4 className="text-purple-400 font-medium mb-2">About Advanced Multi-Party QKD</h4>
          <p className="text-gray-400 leading-relaxed">
            Advanced Multi-Party Quantum Key Distribution (MPQKD) extends quantum security to groups. 
            Using quantum principles like entanglement and superposition, it enables secure communication 
            across multiple parties while detecting eavesdropping attempts. The system supports automatic 
            key rotation, forward secrecy, and hierarchical access control.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
