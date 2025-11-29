import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '../../shared/api';

interface TutorData {
  // Step 1: Personal Information
  fullName: string;
  bio: string;
  location: {
    city: string;
    country: string;
  };
  profileImage: string;
  
  // Step 2: Expertise
  subjects: Array<{
    subject: string;
    level: string;
    hourlyRate: number;
  }>;
  qualifications: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience: {
    years: number;
    description: string;
  };
  certificates: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate: string;
  }>;
  languages: string[];
  
  // Step 3: Pricing & Availability
  hourlyRate: number;
  generalAvailability: string;
  resume: string; // URL or base64 for uploaded resume
}

const initialTutorData: TutorData = {
  fullName: '',
  bio: '',
  location: { city: '', country: '' },
  profileImage: '',
  subjects: [{ subject: '', level: 'beginner', hourlyRate: 25 }],
  qualifications: [{ degree: '', institution: '', year: new Date().getFullYear() }],
  experience: { years: 0, description: '' },
  certificates: [],
  languages: [],
  hourlyRate: 25,
  generalAvailability: '',
  resume: ''
};

const steps = [
  { id: 1, title: 'Personal Info', description: 'Basic information about you' },
  { id: 2, title: 'Expertise', description: 'Your teaching expertise' },
  { id: 3, title: 'Pricing & Availability', description: 'Set your rates and schedule' },
  { id: 4, title: 'Review & Submit', description: 'Review and submit your profile' }
];

export default function TutorRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [tutorData, setTutorData] = useState<TutorData>(initialTutorData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleInputChange = (field: string, value: any) => {
    setTutorData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setTutorData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof TutorData] as any),
        [childField]: value
      }
    }));
    setError('');
  };

  const handleArrayInputChange = (field: string, index: number, childField: string, value: any) => {
    setTutorData(prev => ({
      ...prev,
      [field]: (prev[field as keyof TutorData] as any[]).map((item: any, i: number) => 
        i === index ? { ...item, [childField]: value } : item
      )
    }));
    setError('');
  };

  const addArrayItem = (field: string, newItem: any) => {
    setTutorData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof TutorData] as any[]), newItem]
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setTutorData(prev => ({
      ...prev,
      [field]: (prev[field as keyof TutorData] as any[]).filter((_: any, i: number) => i !== index)
    }));
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      // Check if user is authenticated
      if (!user || !localStorage.getItem('token')) {
        setError('You must be logged in to continue. Please log in and try again.');
        return;
      }

      // Save current step data
      try {
        setIsLoading(true);

        // Filter out empty data based on current step
        let dataToSend = { ...tutorData };

        if (currentStep === 2) {
          // For expertise step, filter out empty subjects and qualifications
          dataToSend.subjects = tutorData.subjects.filter(s =>
            s.subject && s.subject.trim() !== '' &&
            s.level && s.level.trim() !== '' &&
            s.hourlyRate && s.hourlyRate >= 5
          );

          dataToSend.qualifications = tutorData.qualifications.filter(q =>
            q.degree && q.degree.trim() !== '' &&
            q.institution && q.institution.trim() !== '' &&
            q.year && q.year > 0
          );
        }

        console.log('Sending step data:', { step: currentStep, data: dataToSend });
        const response = await apiClient.updateTutorRegistrationStep(currentStep, dataToSend);
        if (response.success) {
          setCurrentStep(prev => prev + 1);
          setError('');
        } else {
          setError(response.message || 'Failed to save step data');
        }
      } catch (error) {
        console.error('Error saving step data:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        setError(`Failed to save step data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Check if we have valid subjects
      const validSubjects = tutorData.subjects?.filter(s =>
        s.subject && s.subject.trim() !== '' &&
        s.level && s.level.trim() !== '' &&
        s.hourlyRate && s.hourlyRate >= 5
      ) || [];

      // Check if we have valid qualifications
      const validQualifications = tutorData.qualifications?.filter(q =>
        q.degree && q.degree.trim() !== '' &&
        q.institution && q.institution.trim() !== '' &&
        q.year && q.year > 0
      ) || [];

      if (!tutorData.fullName || validSubjects.length === 0 || !tutorData.hourlyRate) {
        setError('Please complete all required fields: Full Name, at least one valid subject, and hourly rate.');
        setIsLoading(false);
        return;
      }

      const response = await apiClient.completeTutorRegistration(tutorData);
      
      if (response.success) {
        setSuccess('Tutor registration completed successfully!');
        // Invalidate the tutors query to refresh the find-tutor page
        queryClient.invalidateQueries({ queryKey: ['tutors'] });
        setTimeout(() => {
          navigate('/find-tutor');
        }, 2000);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
        <Input
          id="fullName"
          value={tutorData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          placeholder="Enter your full name"
          className="input-modern"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
        <Textarea
          id="bio"
          value={tutorData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Short introduction about you"
          className="input-modern min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">{tutorData.bio.length}/500 characters</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">City</Label>
          <Input
            id="city"
            value={tutorData.location.city}
            onChange={(e) => handleNestedInputChange('location', 'city', e.target.value)}
            placeholder="Enter your city"
            className="input-modern"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium">Country</Label>
          <Input
            id="country"
            value={tutorData.location.country}
            onChange={(e) => handleNestedInputChange('location', 'country', e.target.value)}
            placeholder="Enter your country"
            className="input-modern"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profileImage" className="text-sm font-medium">Profile Picture</Label>
        <div className="flex items-center gap-4">
          <Input
            id="profileImage"
            type="file"
            accept="image/*"
            className="input-modern"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Handle file upload here
                handleInputChange('profileImage', URL.createObjectURL(file));
              }
            }}
          />
          {tutorData.profileImage && (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
              <img src={tutorData.profileImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Subjects</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('subjects', { subject: '', level: 'beginner', hourlyRate: tutorData.hourlyRate || 25 })}
          >
            Add Subject
          </Button>
        </div>
        {tutorData.subjects.map((subject, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label className="text-xs">Subject</Label>
              <Input
                value={subject.subject}
                onChange={(e) => handleArrayInputChange('subjects', index, 'subject', e.target.value)}
                placeholder="e.g., Math, Physics"
                className="input-modern"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Level</Label>
              <Select
                value={subject.level}
                onValueChange={(value) => handleArrayInputChange('subjects', index, 'level', value)}
              >
                <SelectTrigger className="input-modern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {tutorData.subjects.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem('subjects', index)}
                className="col-span-2"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Subject
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Qualifications</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('qualifications', { degree: '', institution: '', year: new Date().getFullYear() })}
          >
            Add Qualification
          </Button>
        </div>
        {tutorData.qualifications.map((qual, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label className="text-xs">Degree</Label>
              <Input
                value={qual.degree}
                onChange={(e) => handleArrayInputChange('qualifications', index, 'degree', e.target.value)}
                placeholder="e.g., M.Sc. Physics"
                className="input-modern"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Institution</Label>
              <Input
                value={qual.institution}
                onChange={(e) => handleArrayInputChange('qualifications', index, 'institution', e.target.value)}
                placeholder="University name"
                className="input-modern"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Year</Label>
              <Input
                type="number"
                value={qual.year}
                onChange={(e) => handleArrayInputChange('qualifications', index, 'year', parseInt(e.target.value))}
                placeholder="2020"
                className="input-modern"
              />
            </div>
            {tutorData.qualifications.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem('qualifications', index)}
                className="col-span-3"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Qualification
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="experience" className="text-sm font-medium">Experience (Years)</Label>
          <Input
            id="experience"
            type="number"
            value={tutorData.experience.years}
            onChange={(e) => handleNestedInputChange('experience', 'years', parseInt(e.target.value) || 0)}
            placeholder="0"
            className="input-modern"
            min="0"
            max="50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="languages" className="text-sm font-medium">Languages</Label>
          <Input
            id="languages"
            value={tutorData.languages.join(', ')}
            onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(lang => lang.trim()).filter(lang => lang))}
            placeholder="English, Spanish, French"
            className="input-modern"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experienceDesc" className="text-sm font-medium">Experience Description</Label>
        <Textarea
          id="experienceDesc"
          value={tutorData.experience.description}
          onChange={(e) => handleNestedInputChange('experience', 'description', e.target.value)}
          placeholder="Describe your teaching experience"
          className="input-modern min-h-[100px]"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">{tutorData.experience.description.length}/1000 characters</p>
              </div>
              </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate ($)</Label>
        <Input
          id="hourlyRate"
          type="number"
          value={tutorData.hourlyRate}
          onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 25)}
          placeholder="e.g., 25"
          className="input-modern"
          min="5"
          max="1000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="generalAvailability" className="text-sm font-medium">Availability</Label>
        <Input
          id="generalAvailability"
          value={tutorData.generalAvailability}
          onChange={(e) => handleInputChange('generalAvailability', e.target.value)}
          placeholder="e.g., Weekdays 6-9 PM"
          className="input-modern"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review Your Details</h3>
        <p className="text-muted-foreground">Review your details and submit. You can edit this information later from your dashboard.</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Personal Information</h4>
          <p><strong>Name:</strong> {tutorData.fullName}</p>
          <p><strong>Location:</strong> {tutorData.location.city}, {tutorData.location.country}</p>
          <p><strong>Bio:</strong> {tutorData.bio || 'Not provided'}</p>
              </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Subjects and Qualifications</h4>
          <p><strong>Subjects:</strong> {tutorData.subjects.map(s => `${s.subject} (${s.level})`).join(', ')}</p>
          <p><strong>Experience:</strong> {tutorData.experience.years} years</p>
          <p><strong>Qualifications:</strong> {tutorData.qualifications.map(q => `${q.degree} from ${q.institution} (${q.year})`).join(', ')}</p>
              </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Rates and Availability</h4>
          <p><strong>Hourly Rate:</strong> ${tutorData.hourlyRate}</p>
          <p><strong>Availability:</strong> {tutorData.generalAvailability || 'Not specified'}</p>
              </div>
              </div>
            </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return tutorData.fullName.trim() !== '';
      case 2:
        return tutorData.subjects.some(s => s.subject.trim() !== '');
      case 3:
        return tutorData.hourlyRate >= 5;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen gradient-hero py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Register as a Tutor</h1>
          <p className="text-foreground/70">Complete your tutor profile to start teaching</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary border-primary text-white' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
              </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
              </div>
            </div>

        <Card className="card-modern shadow-modern-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {renderCurrentStep()}

            <div className="flex justify-between pt-6">
            <Button
                type="button"
              variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isLoading}
                className="btn-modern"
            >
                <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

              {currentStep < 4 ? (
              <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                  className="btn-modern gradient-primary text-white hover:shadow-lg hover:shadow-primary/25"
              >
                Next
                  <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className="btn-modern gradient-primary text-white hover:shadow-lg hover:shadow-primary/25"
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}