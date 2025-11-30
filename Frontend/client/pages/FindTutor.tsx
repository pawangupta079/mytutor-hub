import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Search, Loader2 } from "lucide-react";
import { apiClient } from "../../shared/api";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface Tutor {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  fullName: string;
  bio?: string;
  location: {
    city: string;
    country: string;
  };
  profileImage?: string;
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
  hourlyRate: number;
  availability: {
    generalAvailability: string;
    calendarSlots: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };
  rating: {
    average: number;
    count: number;
  };
  isVerified: boolean;
  isAvailable: boolean;
}

export default function FindTutor() {
  const navigate = useNavigate();
  const apiBase = (import.meta as any).env?.VITE_API_URL;
  const [filters, setFilters] = useState({
    subject: '',
    level: 'all',
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
    location: '',
    page: 1,
    limit: 12
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tutors', filters, searchQuery],
    queryFn: async () => {
      const apiFilters = {
        ...filters,
        level: filters.level === 'all' ? '' : filters.level,
        subject: searchQuery || filters.subject,
        onlyComplete: false,
        onlyAvailable: false,
      };
      console.log('Fetching tutors with params:', apiFilters);
      const result = await apiClient.searchTutors(apiFilters);
      console.log('Tutors fetched successfully:', result);
      return result;
    },
    enabled: true,
    refetchOnMount: 'always' // Force refetch when component mounts
  });

  useEffect(() => {
    // Refetch tutors when component mounts to ensure fresh data
    refetch();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      subject: searchQuery,
      page: 1
    }));
  };

  const handleBookTutor = (tutorId: string) => {
    navigate(`/book-session/${tutorId}`);
  };

  // Mock data as fallback when API fails
  const mockTutors = [
    {
      _id: "mock-1",
      user: { _id: "user-1", name: "mohan" },
      fullName: "mohan",
      bio: "Experienced math tutor with 1 year of teaching experience",
      location: { city: "noida", country: "ind" },
      subjects: [{ subject: "Math", level: "beginner", hourlyRate: 25 }],
      qualifications: [{ degree: "Bachelor's in Mathematics", institution: "Delhi University", year: 2020 }],
      experience: { years: 1, description: "1 year experience teaching math" },
      languages: ["English", "Hindi"],
      hourlyRate: 25,
      availability: { generalAvailability: "7 days 6 to 9", calendarSlots: [] },
      rating: { average: 4.5, count: 12 },
      isVerified: true,
      isAvailable: true
    },
    {
      _id: "mock-2",
      user: { _id: "user-2", name: "Priya Sharma" },
      fullName: "Priya Sharma",
      bio: "Passionate physics tutor with 3 years of experience",
      location: { city: "Delhi", country: "India" },
      subjects: [{ subject: "Physics", level: "intermediate", hourlyRate: 30 }],
      qualifications: [{ degree: "MSc Physics", institution: "IIT Delhi", year: 2019 }],
      experience: { years: 3, description: "3 years teaching physics to high school students" },
      languages: ["English", "Hindi"],
      hourlyRate: 30,
      availability: { generalAvailability: "Weekdays 5-9 PM", calendarSlots: [] },
      rating: { average: 4.8, count: 25 },
      isVerified: true,
      isAvailable: true
    }
  ];

  const tutors = data?.data?.tutors || (error ? mockTutors : []);
  const pagination = data?.data?.pagination;

  return (
    <main className="container grid gap-8 py-10 md:grid-cols-[280px_1fr]">
      {!apiBase && (
        <div className="md:col-span-2 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          Warning: VITE_API_URL is not set. Set it in Frontend/.env to your backend URL (e.g., https://mytutor-hub.onrender.com/api) and restart the dev server.
        </div>
      )}

      <aside className="hidden rounded-lg border bg-white p-5 md:block">
        <h3 className="font-semibold">Filters</h3>
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <label className="mb-1 block text-foreground/70">
              Price range ($/hr)
            </label>
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={([min, max]) => {
                handleFilterChange('minPrice', min);
                handleFilterChange('maxPrice', max);
              }}
              min={0}
              max={200}
              step={5}
            />
            <div className="mt-1 text-xs text-foreground/60">
              ${filters.minPrice} - ${filters.maxPrice}/hr
            </div>
          </div>
          <div>
            <label className="mb-1 block text-foreground/70">Rating</label>
            <Select 
              value={filters.minRating.toString()} 
              onValueChange={(value) => handleFilterChange('minRating', parseFloat(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All</SelectItem>
                <SelectItem value="3">3+ stars</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-foreground/70">Level</label>
            <Select
              value={filters.level}
              onValueChange={(value) => handleFilterChange('level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </aside>

      <section>
        <div className="rounded-lg border bg-white p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <Input 
              placeholder="Subject (e.g., Math)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Input 
              placeholder="Location (e.g., Delhi)" 
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
            <Select
              value={filters.level}
              onValueChange={(value) => handleFilterChange('level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleSearch}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Searching for tutors...</p>
            </div>
          </div>
        ) : error ? (
          <div className="mt-6 text-center py-12">
            <p className="text-red-600">Error loading tutors. Please try again.</p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </div>
        ) : tutors.length === 0 ? (
          <div className="mt-6 text-center py-12">
            <p className="text-gray-600">No tutors found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tutors.map((tutor: Tutor) => {
                const primarySubject = tutor.subjects[0];
                const hourlyRate = tutor.hourlyRate || primarySubject?.hourlyRate || 0;
                
                return (
                  <Card key={tutor._id} className="card-modern hover-lift overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                          {tutor.profileImage ? (
                            <img 
                              src={tutor.profileImage} 
                              alt={tutor.fullName || tutor.user.name}
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          ) : tutor.user.avatar ? (
                            <img 
                              src={tutor.user.avatar} 
                              alt={tutor.fullName || tutor.user.name}
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-semibold text-primary">
                              {(tutor.fullName || tutor.user.name).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg text-foreground">{tutor.fullName || tutor.user.name}</CardTitle>
                            {tutor.isVerified && (
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <Star className="h-3 w-3 text-white fill-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {primarySubject?.subject} • {primarySubject?.level}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tutor.location.city}, {tutor.location.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">
                          {tutor.experience.years} years experience
                        </span>
                        <span className="text-lg font-bold text-primary">
                          ${hourlyRate}/hr
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {tutor.bio && (
                        <p className="text-sm text-foreground/70 line-clamp-2">
                          {tutor.bio}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {tutor.qualifications.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span>Education:</span>
                            <span className="font-medium">{tutor.qualifications[0].degree}</span>
                          </div>
                        )}
                        {tutor.languages.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span>Languages:</span>
                            <span className="font-medium">{tutor.languages.slice(0, 2).join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {tutor.availability.generalAvailability && (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          <span className="font-medium">Availability:</span> {tutor.availability.generalAvailability}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star size={14} fill="currentColor" className="text-yellow-400" />
                          <span className="font-medium">{(tutor.rating?.average ?? 0).toFixed(1)}</span>
                          <span className="text-muted-foreground">({tutor.rating?.count ?? 0})</span>
                        </div>
                        <span className="text-muted-foreground">
                          {tutor.subjects.length} subject{tutor.subjects.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <Button 
                        className="w-full btn-modern gradient-primary text-white hover:shadow-lg hover:shadow-primary/25"
                        onClick={() => handleBookTutor(tutor._id)}
                        disabled={!tutor.isAvailable}
                      >
                        {tutor.isAvailable ? 'Book Session' : 'Currently Unavailable'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-foreground/70">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
