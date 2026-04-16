import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SendIcon from '@mui/icons-material/Send';
import { careerAPI } from '@/api/apiService';
import { parseJSON } from '@/utils/imageUtils';
import { format } from 'date-fns';
import Loading from '@/components/Loading';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CareerDetail = ({ companyInfo, currentSlug }) => {
    const { slug: paramSlug } = useParams();
    const router = useRouter();
    const slug = currentSlug || paramSlug;
    const [career, setCareer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedJobs, setRelatedJobs] = useState([]);

    useEffect(() => {
        const fetchCareer = async () => {
            try {
                setLoading(true);
                const response = await careerAPI.getBySlug(slug);
                setCareer(response.data);

                // Fetch related jobs
                if (response.data?.department) {
                    const allCareers = await careerAPI.getAll();
                    const related = allCareers.data
                        .filter(c => c.department === response.data.department && c.slug !== slug && c.status === 'open' && c.is_active)
                        .slice(0, 3);
                    setRelatedJobs(related);
                }
            } catch (err) {
                setError('Job not found');
            } finally {
                setLoading(false);
            }
        };
        fetchCareer();
    }, [slug]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    const employmentTypeLabels = {
        full_time: 'Full Time',
        part_time: 'Part Time',
        contract: 'Contract',
        internship: 'Internship',
        freelance: 'Freelance',
    };

    const experienceLevelLabels = {
        entry: 'Entry Level',
        junior: 'Junior',
        mid: 'Mid Level',
        senior: 'Senior',
        lead: 'Lead',
        manager: 'Manager',
    };

    if (loading) return <Loading fullScreen />;

    if (error || !career) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Job position not found</p>
                    <button onClick={() => router.push('/')} className="btn-primary">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const responsibilities = parseJSON(career.responsibilities, []);
    const requirements = parseJSON(career.requirements, []);
    const qualifications = parseJSON(career.qualifications, []);
    const benefits = parseJSON(career.benefits, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
            <Navbar companyInfo={companyInfo} />

            {/* Hero Section */}
            <div className="relative pt-20 pb-32 bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '30px 30px'
                    }}></div>
                </div>

                {/* Gradient Orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        href="/#careers"
                        className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors group"
                    >
                        <ArrowBackIcon className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Careers
                    </Link>

                    <div className="max-w-4xl">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            {career.is_featured && (
                                <Chip
                                    label="Featured Position"
                                    sx={{
                                        backgroundColor: 'rgba(251, 191, 36, 0.2)',
                                        color: '#fbbf24',
                                        fontWeight: 600,
                                    }}
                                />
                            )}
                            {career.department && (
                                <Chip
                                    icon={<WorkIcon sx={{ color: 'white !important', fontSize: 16 }} />}
                                    label={career.department}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                        color: 'white',
                                        fontWeight: 600,
                                    }}
                                />
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            {career.job_title}
                        </h1>

                        {/* Quick Info */}
                        <div className="flex flex-wrap gap-6 mb-8 text-white/90">
                            {career.location && (
                                <div className="flex items-center gap-2">
                                    <LocationOnIcon />
                                    <span>{career.location}</span>
                                </div>
                            )}
                            {career.employment_type && (
                                <div className="flex items-center gap-2">
                                    <AccessTimeIcon />
                                    <span>{employmentTypeLabels[career.employment_type] || career.employment_type}</span>
                                </div>
                            )}
                            {career.experience_level && (
                                <div className="flex items-center gap-2">
                                    <SchoolIcon />
                                    <span>{experienceLevelLabels[career.experience_level] || career.experience_level}</span>
                                </div>
                            )}
                        </div>

                        {career.salary_range && (
                            <div className="inline-block bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-4 mb-8">
                                <span className="text-white/60 text-sm">Salary Range</span>
                                <div className="text-2xl font-bold text-primary-400">
                                    {career.salary_range}
                                </div>
                            </div>
                        )}

                        {/* Apply Button */}
                        <div className="flex flex-wrap gap-4">
                            {career.application_url ? (
                                <a
                                    href={career.application_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg"
                                >
                                    <SendIcon className="mr-2" />
                                    Apply Now
                                </a>
                            ) : career.contact_email && (
                                <a
                                    href={`mailto:${career.contact_email}?subject=Application for ${career.job_title}`}
                                    className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg"
                                >
                                    <SendIcon className="mr-2" />
                                    Apply via Email
                                </a>
                            )}
                            <Link
                                href="/#contact"
                                className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all backdrop-blur-lg border border-white/20"
                            >
                                Ask Questions
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        {career.description && (
                            <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 md:p-10 shadow-xl">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                    <div className="w-1 h-8 bg-primary-500 rounded-full mr-4"></div>
                                    About This Role
                                </h2>
                                <div
                                    className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                                    dangerouslySetInnerHTML={{ __html: career.description }}
                                />
                            </div>
                        )}

                        {/* Responsibilities */}
                        {responsibilities.length > 0 && (
                            <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 md:p-10 shadow-xl">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mr-3">
                                        <WorkIcon className="text-blue-500" />
                                    </div>
                                    Responsibilities
                                </h3>
                                <ul className="space-y-4">
                                    {responsibilities.map((item, idx) => (
                                        <li key={idx} className="flex items-start group">
                                            <CheckCircleIcon className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" fontSize="small" />
                                            <span className="text-gray-600 dark:text-gray-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Requirements & Qualifications */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {requirements.length > 0 && (
                                <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-xl">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mr-3">
                                            <AccessTimeIcon className="text-amber-500" />
                                        </div>
                                        Requirements
                                    </h3>
                                    <ul className="space-y-3">
                                        {requirements.map((item, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3 flex-shrink-0"></div>
                                                <span className="text-gray-600 dark:text-gray-300 text-sm">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {qualifications.length > 0 && (
                                <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-xl">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mr-3">
                                            <SchoolIcon className="text-purple-500" />
                                        </div>
                                        Qualifications
                                    </h3>
                                    <ul className="space-y-3">
                                        {qualifications.map((item, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                                                <span className="text-gray-600 dark:text-gray-300 text-sm">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Benefits */}
                        {benefits.length > 0 && (
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 md:p-10 text-white">
                                <h3 className="text-2xl font-bold mb-6 flex items-center">
                                    <CardGiftcardIcon className="mr-3" sx={{ fontSize: 32 }} />
                                    What We Offer
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {benefits.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                                            <CheckCircleIcon fontSize="small" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Job Details Card */}
                        <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-xl sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Job Details
                            </h3>
                            <div className="space-y-4">
                                {career.department && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <WorkIcon fontSize="small" />
                                            Department
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {career.department}
                                        </span>
                                    </div>
                                )}
                                {career.employment_type && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <AccessTimeIcon fontSize="small" />
                                            Type
                                        </span>
                                        <Chip
                                            label={employmentTypeLabels[career.employment_type]}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                                color: '#dc2626',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </div>
                                )}
                                {career.experience_level && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <SchoolIcon fontSize="small" />
                                            Level
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {experienceLevelLabels[career.experience_level]}
                                        </span>
                                    </div>
                                )}
                                {career.location && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <LocationOnIcon fontSize="small" />
                                            Location
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white text-right text-sm">
                                            {career.location}
                                        </span>
                                    </div>
                                )}
                                {career.application_deadline && (
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <CalendarTodayIcon fontSize="small" />
                                            Deadline
                                        </span>
                                        <span className="font-medium text-primary-600 dark:text-primary-400">
                                            {formatDate(career.application_deadline)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Apply CTA */}
                            <div className="mt-8">
                                {career.application_url ? (
                                    <a
                                        href={career.application_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-center transition-all hover:scale-105"
                                    >
                                        Apply Now
                                    </a>
                                ) : career.contact_email && (
                                    <a
                                        href={`mailto:${career.contact_email}?subject=Application for ${career.job_title}`}
                                        className="block w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-center transition-all hover:scale-105"
                                    >
                                        Apply via Email
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Share Card */}
                        <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-xl text-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Know Someone Perfect?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                                Share this opportunity with your network
                            </p>
                            <button
                                onClick={() => navigator.share?.({ title: career.job_title, url: window.location.href })}
                                className="w-full py-3 border-2 border-primary-600 text-primary-600 dark:text-primary-400 font-semibold rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                                Share This Job
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Jobs */}
                {relatedJobs.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                            Similar Positions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedJobs.map((job) => (
                                <Link
                                    key={job.id}
                                    href={`/careers/${job.slug}`}
                                    className="group bg-white dark:bg-dark-900 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-3">
                                        {job.job_title}
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        {job.department && (
                                            <div className="flex items-center gap-2">
                                                <WorkIcon fontSize="small" />
                                                {job.department}
                                            </div>
                                        )}
                                        {job.location && (
                                            <div className="flex items-center gap-2">
                                                <LocationOnIcon fontSize="small" />
                                                {job.location}
                                            </div>
                                        )}
                                    </div>
                                    {job.employment_type && (
                                        <Chip
                                            label={employmentTypeLabels[job.employment_type]}
                                            size="small"
                                            sx={{ mt: 3, backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', fontWeight: 600 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer companyInfo={companyInfo} />
        </div>
    );
};

export default CareerDetail;
