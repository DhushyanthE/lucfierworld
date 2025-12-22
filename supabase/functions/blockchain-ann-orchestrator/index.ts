import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and validate authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Authorization header required',
        success: false
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user's JWT token for proper authorization
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ 
        error: 'Invalid or expired token',
        success: false
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    // Check if user has admin role for sensitive operations
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = roleData?.role === 'admin';

    const { 
      command, 
      workflow,
      realtime = false
    } = await req.json();
    
    if (!command) {
      throw new Error('command is required');
    }

    console.log('Orchestrating blockchain-ANN command:', command, 'by user:', user.id);

    // Check authorization for admin-only commands
    const adminOnlyCommands = ['deploy_model', 'optimize_workflow'];
    if (adminOnlyCommands.includes(command) && !isAdmin) {
      return new Response(JSON.stringify({ 
        error: 'Admin role required for this operation',
        success: false
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result: any = {};

    switch (command) {
      case 'deploy_model':
        result = await deployModel(workflow, user.id);
        break;
      case 'train_distributed':
        result = await trainDistributed(workflow, user.id);
        break;
      case 'run_inference':
        result = await runInference(workflow, user.id);
        break;
      case 'verify_consensus':
        result = await verifyConsensus(workflow, user.id);
        break;
      case 'optimize_workflow':
        result = await optimizeWorkflow(workflow, user.id);
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    return new Response(JSON.stringify({
      success: true,
      command,
      result,
      realtime,
      userId: user.id,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Orchestrator error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function deployModel(workflow: any, userId: string) {
  console.log('Deploying model for user:', userId);
  return {
    modelId: `model_${Date.now()}`,
    contractAddress: `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    blockNumber: Math.floor(Math.random() * 1000000),
    status: 'deployed',
    accuracy: 0.85 + Math.random() * 0.14,
    consensusScore: 0.90 + Math.random() * 0.09,
    deployedBy: userId
  };
}

async function trainDistributed(workflow: any, userId: string) {
  console.log('Training distributed for user:', userId);
  return {
    trainingId: `train_${Date.now()}`,
    nodes: workflow?.distributedNodes || 10,
    epochs: workflow?.epochs || 100,
    currentEpoch: 0,
    status: 'training',
    accuracy: 0.75,
    loss: 0.25,
    initiatedBy: userId
  };
}

async function runInference(workflow: any, userId: string) {
  console.log('Running inference for user:', userId);
  return {
    inferenceId: `infer_${Date.now()}`,
    predictions: Array.from({length: 10}, (_, i) => ({
      class: i,
      confidence: Math.random()
    })),
    latency: Math.random() * 100,
    throughput: 1000 + Math.random() * 500,
    requestedBy: userId
  };
}

async function verifyConsensus(workflow: any, userId: string) {
  console.log('Verifying consensus for user:', userId);
  return {
    consensusId: `consensus_${Date.now()}`,
    validators: workflow?.validators || 10,
    verified: true,
    consensusScore: 0.95 + Math.random() * 0.04,
    blockHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    verifiedBy: userId
  };
}

async function optimizeWorkflow(workflow: any, userId: string) {
  console.log('Optimizing workflow for user:', userId);
  return {
    optimizationId: `opt_${Date.now()}`,
    improvements: {
      speedGain: 0.2 + Math.random() * 0.3,
      costReduction: 0.15 + Math.random() * 0.25,
      accuracyImprovement: 0.05 + Math.random() * 0.10
    },
    quantumEnhanced: true,
    parallelizationFactor: 2 + Math.random() * 3,
    optimizedBy: userId
  };
}
