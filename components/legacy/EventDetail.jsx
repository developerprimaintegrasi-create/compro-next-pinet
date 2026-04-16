import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import VideocamIcon from '@mui/icons-material/Videocam';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import { eventAPI } from '@/api/apiService';
import { getImageUrl, parseJSON } from '@/utils/imageUtils';
import { format } from 'date-fns';
import Loading from '@/components/Loading';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const EventDetail = ({ companyInfo, currentSlug }) => {
    const { slug: paramSlug } = useParams();
    const router = useRouter();
    const slug = currentSlug || paramSlug;
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedEvents, setRelatedEvents] = useState([]);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const response = await eventAPI.getBySlug(slug);
                setEvent(response.data);

                // Fetch related events
                const allEvents = await eventAPI.getAll();
                const related = allEvents.data
                    .filter(e => e.slug !== slug && e.is_published && new Date(e.start_date) >= new Date())
                    .slice(0, 3);
                setRelatedEvents(related);
            } catch (err) {
                setError('Event not found');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [slug]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'EEEE, MMMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    const formatShortDate = (dateString) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    if (loading) return <Loading fullScreen />;

    if (error || !event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Event not found</p>
                    <button onClick={() => router.push('/')} className="btn-primary">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const gallery = parseJSON(event.gallery, []);
    const allImages = event.featured_image ? [event.featured_image, ...gallery] : gallery;

    const eventTypeColors = {
        seminar: 'from-blue-500 to-indigo-600',
        workshop: 'from-purple-500 to-violet-600',
        conference: 'from-emerald-500 to-teal-600',
        webinar: 'from-cyan-500 to-blue-600',
        training: 'from-amber-500 to-orange-600',
        exhibition: 'from-rose-500 to-red-600',
        other: 'from-gray-500 to-slate-600',
    };

    const gradientClass = eventTypeColors[event.event_type] || eventTypeColors.other;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
            <Navbar companyInfo={companyInfo} />

            {/* Hero Section */}
            <div className={`relative pt-20 pb-32 bg-gradient-to-br ${gradientClass} overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        href="/#events"
                        className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors group"
                    >
                        <ArrowBackIcon className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Events
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Event Info */}
                        <div className="text-white">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                {event.event_type && (
                                    <Chip
                                        label={event.event_type}
                                        sx={{
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 600,
                                            textTransform: 'capitalize',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    />
                                )}
                                {event.is_online && (
                                    <Chip
                                        icon={<VideocamIcon sx={{ color: 'white !important', fontSize: 16 }} />}
                                        label="Online Event"
                                        sx={{
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 600,
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    />
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                {event.title}
                            </h1>

                            {/* Quick Info */}
                            <div className="space-y-3 mb-8">
                                {event.start_date && (
                                    <div className="flex items-center gap-3 text-white/90">
                                        <CalendarTodayIcon />
                                        <span className="text-lg">
                                            {formatDate(event.start_date)}
                                            {event.end_date && event.end_date !== event.start_date && (
                                                <> - {formatShortDate(event.end_date)}</>
                                            )}
                                        </span>
                                    </div>
                                )}
                                {(event.start_time || event.end_time) && (
                                    <div className="flex items-center gap-3 text-white/90">
                                        <AccessTimeIcon />
                                        <span className="text-lg">
                                            {event.start_time}
                                            {event.end_time && <> - {event.end_time}</>}
                                        </span>
                                    </div>
                                )}
                                {!event.is_online && (event.venue || event.location) && (
                                    <div className="flex items-center gap-3 text-white/90">
                                        <LocationOnIcon />
                                        <span className="text-lg">{event.venue || event.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4">
                                {(event.registration_url || event.meeting_link) && (
                                    <a
                                        href={event.registration_url || event.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-bold rounded-xl transition-all hover:scale-105 shadow-lg"
                                    >
                                        <EventIcon className="mr-2" />
                                        {event.registration_url ? 'Register Now' : 'Join Event'}
                                    </a>
                                )}
                                <Link
                                    href="/#contact"
                                    className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all backdrop-blur-lg border border-white/20"
                                >
                                    Contact Organizer
                                </Link>
                            </div>
                        </div>

                        {/* Event Image */}
                        {allImages.length > 0 && (
                            <div className="relative">
                                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-4 shadow-2xl">
                                    <div className="relative aspect-video rounded-2xl overflow-hidden">
                                        <img
                                            src={getImageUrl(allImages[activeImage])}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {allImages.length > 1 && (
                                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                            {allImages.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveImage(idx)}
                                                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx
                                                        ? 'border-white ring-2 ring-white/50'
                                                        : 'border-transparent hover:border-white/50'
                                                        }`}
                                                >
                                                    <img
                                                        src={getImageUrl(img)}
                                                        alt={`${event.title} ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        {event.description && (
                            <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 md:p-10 shadow-xl">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                    <div className="w-1 h-8 bg-primary-500 rounded-full mr-4"></div>
                                    About This Event
                                </h2>
                                <div
                                    className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                                    dangerouslySetInnerHTML={{ __html: event.description }}
                                />
                            </div>
                        )}

                        {/* Map or Address */}
                        {!event.is_online && event.address && (
                            <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-xl">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <LocationOnIcon className="mr-2 text-primary-500" />
                                    Location
                                </h3>
                                <div className="bg-gray-100 dark:bg-dark-800 rounded-2xl p-6">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {event.venue || event.location}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {event.address}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Event Details Card */}
                        <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-xl sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Event Details
                            </h3>
                            <div className="space-y-4">
                                {event.start_date && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <CalendarTodayIcon fontSize="small" />
                                            Date
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white text-right text-sm">
                                            {formatShortDate(event.start_date)}
                                        </span>
                                    </div>
                                )}
                                {event.start_time && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <AccessTimeIcon fontSize="small" />
                                            Time
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {event.start_time}
                                        </span>
                                    </div>
                                )}
                                {event.max_participants && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <PeopleIcon fontSize="small" />
                                            Capacity
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {event.max_participants} seats
                                        </span>
                                    </div>
                                )}
                                {event.event_type && (
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-gray-500 dark:text-gray-400">Type</span>
                                        <Chip
                                            label={event.event_type}
                                            size="small"
                                            sx={{
                                                textTransform: 'capitalize',
                                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                                color: '#dc2626',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Organizer Contact */}
                        {(event.organizer || event.contact_person || event.contact_email || event.contact_phone) && (
                            <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-xl">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    Contact Information
                                </h3>
                                <div className="space-y-4">
                                    {event.organizer && (
                                        <div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Organizer</span>
                                            <p className="font-medium text-gray-900 dark:text-white">{event.organizer}</p>
                                        </div>
                                    )}
                                    {event.contact_person && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                <PersonIcon className="text-primary-600 dark:text-primary-400" fontSize="small" />
                                            </div>
                                            <span className="text-gray-900 dark:text-white">{event.contact_person}</span>
                                        </div>
                                    )}
                                    {event.contact_email && (
                                        <a
                                            href={`mailto:${event.contact_email}`}
                                            className="flex items-center gap-3 group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <EmailIcon className="text-blue-600 dark:text-blue-400" fontSize="small" />
                                            </div>
                                            <span className="text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {event.contact_email}
                                            </span>
                                        </a>
                                    )}
                                    {event.contact_phone && (
                                        <a
                                            href={`tel:${event.contact_phone}`}
                                            className="flex items-center gap-3 group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <PhoneIcon className="text-green-600 dark:text-green-400" fontSize="small" />
                                            </div>
                                            <span className="text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {event.contact_phone}
                                            </span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Events */}
                {relatedEvents.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                            Other Upcoming Events
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedEvents.map((relEvent) => (
                                <Link
                                    key={relEvent.id}
                                    href={`/events/${relEvent.slug}`}
                                    className="group bg-white dark:bg-dark-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2"
                                >
                                    <div className="h-48 overflow-hidden">
                                        {relEvent.featured_image ? (
                                            <img
                                                src={getImageUrl(relEvent.featured_image)}
                                                alt={relEvent.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className={`w-full h-full bg-gradient-to-br ${eventTypeColors[relEvent.event_type] || eventTypeColors.other} flex items-center justify-center`}>
                                                <EventIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                                            <CalendarTodayIcon fontSize="small" />
                                            {formatShortDate(relEvent.start_date)}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                            {relEvent.title}
                                        </h3>
                                    </div>
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

export default EventDetail;
