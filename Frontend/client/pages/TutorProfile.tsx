import { useEffect, useState } from 'react';
import { apiClient } from '../../shared/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TutorProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getTutorProfile()
      .then(res => {
        if (res.success && res.data?.tutor) {
          setProfile(res.data.tutor);
        } else {
          setError(res.message || 'Failed to load profile');
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message || 'Failed to load profile');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  if (!profile) return null;

  return (
    <main className="container py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">My Tutor Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <strong>Name:</strong> {profile.fullName}<br/>
            <strong>Bio:</strong> {profile.bio}<br/>
            <strong>Location:</strong> {profile.location?.city}, {profile.location?.country}
          </div>
          <div>
            <strong>Subjects:</strong> {profile.subjects?.map((s: any) => `${s.subject} (${s.level})`).join(', ')}
          </div>
          <div>
            <strong>Qualifications:</strong> {profile.qualifications?.map((q: any) => `${q.degree} from ${q.institution} (${q.year})`).join(', ')}
          </div>
          <div>
            <strong>Experience:</strong> {profile.experience?.years} years - {profile.experience?.description}
          </div>
          <div>
            <strong>Languages:</strong> {profile.languages?.join(', ')}
          </div>
          <div>
            <strong>Hourly Rate:</strong> ${profile.hourlyRate}
          </div>
          <div>
            <strong>Availability:</strong> {profile.availability?.generalAvailability}
          </div>
          <div>
            <strong>Resume:</strong> {profile.resume ? (
              <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download Resume</a>
            ) : 'Not uploaded'}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}