import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, DollarSign, User, Loader2 } from 'lucide-react';
import { apiClient } from '../../shared/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

export default function BookSession() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');

  // Fetch tutor details
  const { data: tutorData, isLoading: tutorLoading } = useQuery({
    queryKey: ['tutor', tutorId],
    queryFn: () => apiClient.getTutorById(tutorId!),
    enabled: !!tutorId
  });

  // Fetch available time slots
  const { data: slotsData, isLoading: slotsLoading, refetch: refetchSlots } = useQuery({
    queryKey: ['tutor-slots', tutorId, selectedDate],
    queryFn: () => apiClient.getAvailableSlots(tutorId!, selectedDate!.toISOString().split('T')[0]),
    enabled: !!tutorId && !!selectedDate
  });

  // Book session mutation
  const bookSessionMutation = useMutation({
    mutationFn: (sessionData: any) => apiClient.bookSession(sessionData),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Session Booked!',
          description: 'Your session has been successfully booked.',
        });
        queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
        navigate('/student-dashboard');
      } else {
        toast({
          title: 'Booking Failed',
          description: response.message || 'Failed to book session',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'An error occurred while booking the session',
        variant: 'destructive',
      });
    }
  });

  const tutor = tutorData?.data?.tutor;
  const availableSlots = slotsData?.data?.availableSlots || [];

  useEffect(() => {
    if (tutor && tutor.subjects.length > 0) {
      setSelectedSubject(tutor.subjects[0].subject);
      setSelectedLevel(tutor.subjects[0].level);
    }
  }, [tutor]);

  useEffect(() => {
    if (selectedDate) {
      refetchSlots();
    }
  }, [selectedDate, refetchSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleBookSession = () => {
    if (!selectedTimeSlot || !selectedSubject || !selectedLevel) {
      toast({
        title: 'Missing Information',
        description: 'Please select a time slot, subject, and level',
        variant: 'destructive',
      });
      return;
    }

    const sessionData = {
      tutorId: tutorId!,
      subject: selectedSubject,
      level: selectedLevel,
      scheduledDate: new Date(selectedTimeSlot.startTime).toISOString(),
      duration,
      notes
    };

    bookSessionMutation.mutate(sessionData);
  };

  const getHourlyRate = () => {
    if (!tutor || !selectedSubject || !selectedLevel) return 0;
    const subject = tutor.subjects.find(s => s.subject === selectedSubject && s.level === selectedLevel);
    return subject?.hourlyRate || 0;
  };

  const calculatePrice = () => {
    const hourlyRate = getHourlyRate();
    return (hourlyRate * duration) / 60;
  };

  if (tutorLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Tutor not found</h1>
          <p className="text-gray-600 mt-2">The tutor you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/find-tutor')} className="mt-4">
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Tutor Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {tutor.user.avatar ? (
                    <img 
                      src={tutor.user.avatar} 
                      alt={tutor.user.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-primary font-semibold">
                      {tutor.user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">{tutor.user.name}</CardTitle>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={16} fill="currentColor" className="text-yellow-400" />
                    <span className="font-medium">{tutor.rating.average.toFixed(1)}</span>
                    <span className="text-sm text-gray-600">({tutor.rating.count} reviews)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tutor.bio && (
                <p className="text-sm text-gray-600 mb-4">{tutor.bio}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm">{tutor.experience.years} years experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-500" />
                  <span className="text-sm">From ${Math.min(...tutor.subjects.map(s => s.hourlyRate))}/hr</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subject and Level Selection */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutor.subjects.map((subject, index) => (
                        <SelectItem key={index} value={subject.subject}>
                          {subject.subject} ({subject.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {tutor.subjects
                        .filter(s => s.subject === selectedSubject)
                        .map((subject, index) => (
                          <SelectItem key={index} value={subject.level}>
                            {subject.level}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Calendar */}
              <div>
                <Label>Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <Label>Available Time Slots</Label>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-gray-600 py-4">No available slots for this date</p>
                  ) : (
                    <div className="grid gap-2 mt-2 sm:grid-cols-2">
                      {availableSlots.map((slot: TimeSlot, index: number) => (
                        <Button
                          key={index}
                          variant={selectedTimeSlot === slot ? "default" : "outline"}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className="justify-start"
                        >
                          {new Date(slot.startTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific topics or requirements for this session..."
                  rows={3}
                />
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-xl font-bold text-primary">
                    ${calculatePrice().toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  ${getHourlyRate()}/hr × {duration} minutes
                </p>
              </div>

              {/* Book Button */}
              <Button
                onClick={handleBookSession}
                disabled={!selectedTimeSlot || bookSessionMutation.isPending}
                className="w-full"
                size="lg"
              >
                {bookSessionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking Session...
                  </>
                ) : (
                  'Book Session'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
