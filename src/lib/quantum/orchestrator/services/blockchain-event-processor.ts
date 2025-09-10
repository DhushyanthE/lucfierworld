
import { DataRegisteredEvent, AccessRequestedEvent } from '../types';
import { ipfsService } from '../ipfs.service';
import { eventManager } from '../event-manager';
import { aiProcessor } from '../ai-processor';
import { toast } from 'sonner';

/**
 * Service responsible for processing blockchain events
 */
export class BlockchainEventProcessor {
  /**
   * Process a DataRegistered event
   */
  public async processDataRegistered(event: DataRegisteredEvent, quantumSeedEnabled: boolean): Promise<void> {
    console.log("Processing DataRegistered event:", event);
    
    // Notify listeners
    eventManager.notifyListeners('dataRegistered', event);
    
    try {
      // Generate a quantum seed if enabled
      const quantumSeed = quantumSeedEnabled ? 
        await aiProcessor.generateQuantumSeed() : null;
      
      // Prepare prompt for AI reasoning
      const promptPrefix = quantumSeed ? `[quantum_seed=${quantumSeed}] ` : '';
      const prompt = `${promptPrefix}You are a genomic data AI analyst. Please provide a detailed summary of the genomic dataset stored at IPFS hash ${event.ipfsHash}. Consider coverage depth, species, file sizes, and potential research applications.`;
      
      // Process with AGI module
      const aiResponse = await aiProcessor.processWithAGI(prompt, event.dataId);
      
      console.log("AI generated summary:", aiResponse);
      
      // Store result to IPFS
      const ipfsCID = await ipfsService.addJSON({
        dataId: event.dataId,
        summary: aiResponse.result,
        reasoning: aiResponse.reasoning,
        confidence: aiResponse.confidence,
        quantumEnhanced: aiResponse.quantumEnhanced,
        timestamp: Date.now()
      });
      
      // Simulate emitting DataSummarized event on blockchain
      console.log(`Emitting DataSummarized(${event.dataId}, ${ipfsCID})`);
      
      // Notify listeners about the summary
      eventManager.notifyListeners('dataSummarized', {
        dataId: event.dataId,
        summaryCID: ipfsCID,
        summary: aiResponse.result
      });
      
      toast.success("Genomic data summarized by AGI", {
        description: `Data ID: ${event.dataId.substring(0, 8)}...`
      });
    } catch (error) {
      console.error("Error processing DataRegistered event:", error);
      toast.error("Failed to process genomic data", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  
  /**
   * Process an AccessRequested event
   */
  public async processAccessRequested(event: AccessRequestedEvent, quantumSeedEnabled: boolean): Promise<void> {
    console.log("Processing AccessRequested event:", event);
    
    // Notify listeners
    eventManager.notifyListeners('accessRequested', event);
    
    try {
      // Generate a quantum seed if enabled
      const quantumSeed = quantumSeedEnabled ? 
        await aiProcessor.generateQuantumSeed() : null;
      
      // Prepare prompt for AI reasoning
      const promptPrefix = quantumSeed ? `[quantum_seed=${quantumSeed}] ` : '';
      const prompt = `${promptPrefix}You are a genomic data access control AI. User ${event.requester} is requesting access to genomic dataset ${event.dataId} for the purpose: "${event.purpose}". Assess privacy risks, ethical considerations, and provide a recommendation on whether to approve or deny this access request. Consider data sensitivity and research value.`;
      
      // Process with AGI module
      const aiResponse = await aiProcessor.processWithAGI(prompt, `${event.dataId}_${event.requestId}`);
      
      console.log("AI generated assessment:", aiResponse);
      
      // Determine if access should be granted
      const shouldApprove = aiProcessor.determineApproval(aiResponse.result);
      
      // Store result to IPFS
      const ipfsCID = await ipfsService.addJSON({
        dataId: event.dataId,
        requestId: event.requestId,
        assessment: aiResponse.result,
        reasoning: aiResponse.reasoning,
        approved: shouldApprove,
        confidence: aiResponse.confidence,
        quantumEnhanced: aiResponse.quantumEnhanced,
        timestamp: Date.now()
      });
      
      // Simulate blockchain transaction based on decision
      if (shouldApprove) {
        console.log(`Calling grantAccess(${event.dataId}, ${event.requestId}, ${ipfsCID})`);
        
        // Simulate blockchain transaction completion
        setTimeout(() => {
          // Notify listeners about approved access
          eventManager.notifyListeners('accessApproved', {
            dataId: event.dataId,
            requestId: event.requestId,
            requester: event.requester,
            assessmentCID: ipfsCID,
            assessment: aiResponse.result
          });
          
          toast.success("Access request approved by AGI", {
            description: `Request ID: ${event.requestId.substring(0, 8)}...`
          });
        }, 2000);
      } else {
        console.log(`Calling denyAccess(${event.dataId}, ${event.requestId}, ${ipfsCID})`);
        
        // Simulate blockchain transaction completion
        setTimeout(() => {
          // Notify listeners about denied access
          eventManager.notifyListeners('accessDenied', {
            dataId: event.dataId,
            requestId: event.requestId,
            requester: event.requester,
            assessmentCID: ipfsCID,
            assessment: aiResponse.result
          });
          
          toast.info("Access request denied by AGI", {
            description: `Request ID: ${event.requestId.substring(0, 8)}...`
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Error processing AccessRequested event:", error);
      toast.error("Failed to process access request", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}

export const blockchainEventProcessor = new BlockchainEventProcessor();
export default blockchainEventProcessor;
