import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { candidateApiCall } from '../../../utils/tokenManager';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromOnboarding = location.state?.fromOnboarding;
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await candidateApiCall('get', `/candidates/${id}`);
        console.log('Candidate data received:', response.data);
        setCandidate(response);
      } catch (err) {
        console.error('Error fetching candidate:', err);
        setError('Failed to fetch candidate details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!candidate) return <div className="p-6">Candidate not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/candidate/candidates')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {fromOnboarding ? 'Back to Onboarding' : 'Back to Candidates'}
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
                {candidate.firstName?.[0]}{candidate.lastName?.[0]}
              </span>
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {candidate.firstName} {candidate.lastName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{candidate.position}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Contact & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">{candidate.email}</span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">{candidate.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  {candidate.address?.street}, {candidate.address?.zipCode}, {candidate.address?.city}, {candidate.address?.country}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employment Details</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">{candidate.department}</span>
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">{candidate.position}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  Hired: {candidate.hireDate ? new Date(candidate.hireDate).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column - Additional Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
            <div className="text-gray-600 dark:text-gray-300">No notes available.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails; 