
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Check, ChevronRight, Loader2 } from 'lucide-react';

export default function ApplicationProcess() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    description: '',
    useCase: '',
    experience: '',
    expectedVolume: ''
  });
  const [aiAnalysisResult, setAiAnalysisResult] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.website) {
        toast.error("Please fill out all required fields");
        return false;
      }
      if (!formData.email.includes('@')) {
        toast.error("Please enter a valid email address");
        return false;
      }
    } else if (step === 2) {
      if (!formData.description || !formData.useCase) {
        toast.error("Please fill out all required fields");
        return false;
      }
      if (formData.description.length < 50) {
        toast.error("Project description should be at least 50 characters");
        return false;
      }
    }
    return true;
  };
  
  const goToNextStep = () => {
    if (validateCurrentStep()) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const goToPrevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use aiService to generate text based on form data (fixed to mock)
      // aiService.generateText({
      //   prompt: `Analyze this blockchain project application: ${JSON.stringify(formData)}`,
      //   maxLength: 500
      // })
      
      // Simulate AI analysis result
      setAiAnalysisResult(`Our AI has analyzed your application for ${formData.name} and found it to be a promising use case for Quantum Coin integration. The ${formData.useCase} aligns well with our blockchain capabilities, particularly in terms of transaction throughput and security requirements. We recommend proceeding to the technical integration phase. Our team will contact you at ${formData.email} within 2 business days to discuss next steps.`);
      
      setStep(4);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Quantum Coin Integration Application</h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Apply to integrate your project with Quantum Coin's blockchain network and leverage our quantum-secure, high-throughput infrastructure.
        </p>
      </div>
      
      {/* Progress Steps */}
      <div className="flex justify-between mb-8 px-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${s < step ? 'bg-green-500 text-white' : s === step ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              {s < step ? <Check className="h-5 w-5" /> : s}
            </div>
            <span 
              className={`text-xs mt-2 
                ${s < step ? 'text-green-400' : s === step ? 'text-purple-400' : 'text-gray-500'}`}
            >
              {s === 1 ? 'Basic Info' : s === 2 ? 'Project Details' : s === 3 ? 'Review' : 'Complete'}
            </span>
          </div>
        ))}
      </div>
      
      <Card className="bg-black/40 border-purple-500/30">
        <CardHeader>
          <CardTitle>
            {step === 1 ? 'Basic Information' : 
             step === 2 ? 'Project Details' : 
             step === 3 ? 'Review Your Application' : 
             'Application Submitted'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form id="application-form" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Project/Company Name *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="mt-1 bg-gray-900/60 border-gray-800"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-gray-300">Contact Email *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    className="mt-1 bg-gray-900/60 border-gray-800"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website" className="text-gray-300">Website *</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    value={formData.website} 
                    onChange={handleInputChange} 
                    className="mt-1 bg-gray-900/60 border-gray-800"
                    placeholder="https://"
                  />
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-gray-300">Project Description *</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    className="mt-1 bg-gray-900/60 border-gray-800"
                    rows={4}
                    placeholder="Describe your project in detail..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="useCase" className="text-gray-300">Quantum Coin Use Case *</Label>
                  <Textarea 
                    id="useCase" 
                    name="useCase" 
                    value={formData.useCase} 
                    onChange={handleInputChange} 
                    className="mt-1 bg-gray-900/60 border-gray-800"
                    rows={3}
                    placeholder="How do you plan to integrate with Quantum Coin?"
                  />
                </div>
                
                <div>
                  <Label htmlFor="experience" className="text-gray-300">Blockchain Experience</Label>
                  <Textarea 
                    id="experience" 
                    name="experience" 
                    value={formData.experience} 
                    onChange={handleInputChange} 
                    className="mt-1 bg-gray-900/60 border-gray-800"
                    rows={2}
                    placeholder="Describe your team's experience with blockchain technology..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="expectedVolume" className="text-gray-300">Expected Transaction Volume</Label>
                  <Input 
                    id="expectedVolume" 
                    name="expectedVolume" 
                    value={formData.expectedVolume} 
                    onChange={handleInputChange} 
                    className="mt-1 bg-gray-900/60 border-gray-800"
                    placeholder="e.g., 10,000 tx/day"
                  />
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-5">
                <p className="text-gray-400 text-sm">Please review your application details before submitting:</p>
                
                <div className="space-y-3">
                  <div className="bg-gray-900/40 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-400">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div className="text-gray-500">Project/Company Name:</div>
                      <div className="text-white">{formData.name}</div>
                      
                      <div className="text-gray-500">Contact Email:</div>
                      <div className="text-white">{formData.email}</div>
                      
                      <div className="text-gray-500">Website:</div>
                      <div className="text-white">{formData.website}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/40 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-400">Project Details</h4>
                    
                    <div className="mt-2 space-y-3 text-sm">
                      <div>
                        <div className="text-gray-500">Project Description:</div>
                        <div className="text-white mt-1">{formData.description}</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-500">Quantum Coin Use Case:</div>
                        <div className="text-white mt-1">{formData.useCase}</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-500">Blockchain Experience:</div>
                        <div className="text-white mt-1">{formData.experience || "Not specified"}</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-500">Expected Transaction Volume:</div>
                        <div className="text-white mt-1">{formData.expectedVolume || "Not specified"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {step === 4 && (
              <div className="text-center space-y-6 py-4">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 p-2">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white">Application Submitted!</h3>
                  <p className="mt-2 text-gray-400">
                    Thank you for your interest in Quantum Coin. Our team will review your application and get back to you shortly.
                  </p>
                </div>
                
                {aiAnalysisResult && (
                  <div className="bg-gray-900/40 p-4 rounded-md text-left">
                    <h4 className="text-sm font-medium text-purple-400 mb-2">AI Analysis Result:</h4>
                    <p className="text-sm text-gray-300">{aiAnalysisResult}</p>
                  </div>
                )}
                
                <div className="border-t border-gray-800 pt-6">
                  <p className="text-sm text-gray-500">
                    Application ID: QC-{Math.floor(100000 + Math.random() * 900000)}
                  </p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
        
        <CardFooter className={`${step === 4 ? 'justify-center' : 'justify-between'} border-t border-gray-800 pt-4`}>
          {step === 4 ? (
            <Button 
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
              onClick={() => window.location.href = '/'}
            >
              Return to Dashboard
            </Button>
          ) : (
            <>
              {step > 1 && (
                <Button 
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:bg-gray-800"
                  onClick={goToPrevStep}
                  type="button"
                >
                  Back
                </Button>
              )}
              
              {step < 3 ? (
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={goToNextStep}
                  type="button"
                >
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : step === 3 && (
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  type="submit"
                  form="application-form"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
