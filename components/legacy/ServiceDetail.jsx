import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { serviceAPI } from '@/api/apiService';
import { getImageUrl } from '@/utils/imageUtils';
import Loading from '@/components/Loading';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ServiceDetail = ({ companyInfo, currentSlug }) => {
    const { slug: paramSlug } = useParams();
    const router = useRouter();
    const slug = currentSlug || paramSlug;
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedServices, setRelatedServices] = useState([]);

    useEffect(() => {
        const fetchService = async () => {
            try {
                setLoading(true);
                const response = await serviceAPI.getBySlug(slug);
                setService(response.data);

                // Fetch related services
                const allServices = await serviceAPI.getAll();
                const related = allServices.data
                    .filter(s => s.slug !== slug && s.is_active)
                    .slice(0, 3);
                setRelatedServices(related);
            } catch (err) {
                setError('Service not found');
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [slug]);

    if (loading) return <Loading fullScreen />;

    if (error || !service) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Service not found</p>
                    <button onClick={() => router.push('/')} className="btn-primary">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
            <Navbar companyInfo={companyInfo} />

            {/* Hero Section */}
            <div className="relative pt-20 pb-40 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>

                {/* Gradient Orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        href="/#services"
                        className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors group"
                    >
                        <ArrowBackIcon className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Services
                    </Link>

                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 mb-6">
                            <BusinessCenterIcon sx={{ color: 'white', fontSize: 20 }} />
                            <span className="text-white/90 font-medium">Our Service</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            {service.name}
                        </h1>

                        {service.short_description && (
                            <p className="text-xl text-white/80 leading-relaxed max-w-3xl">
                                {service.short_description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Featured Image */}
                        {service.image_url && (
                            <div className="bg-white dark:bg-dark-900 rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src={getImageUrl(service.image_url)}
                                    alt={service.name}
                                    className="w-full h-80 md:h-96 object-cover"
                                />
                            </div>
                        )}

                        {/* Description */}
                        {service.description && (
                            <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 md:p-10 shadow-xl">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                    <div className="w-1 h-8 bg-primary-500 rounded-full mr-4"></div>
                                    Service Overview
                                </h2>
                                <div
                                    className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: service.description }}
                                />
                            </div>
                        )}

                        {/* Why Choose Us */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-dark-800 dark:to-dark-900 rounded-3xl p-8 md:p-10 text-white">
                            <h3 className="text-2xl font-bold mb-8">Why Choose Our {service.name}?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: 'Expert Team', desc: 'Highly skilled professionals with years of experience' },
                                    { title: 'Quality Assurance', desc: 'Rigorous testing and quality control processes' },
                                    { title: '24/7 Support', desc: 'Round-the-clock assistance whenever you need' },
                                    { title: 'Competitive Pricing', desc: 'Best value for premium quality services' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4 group">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                                            <CheckCircleOutlineIcon className="text-primary-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                                            <p className="text-white/70 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Quick Info Card */}
                        <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Service Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700">
                                    <span className="text-gray-500 dark:text-gray-400">Category</span>
                                    <Chip label="Professional Service" size="small" color="primary" />
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-dark-700">
                                    <span className="text-gray-500 dark:text-gray-400">Availability</span>
                                    <span className="font-medium text-green-500">Available Now</span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-gray-500 dark:text-gray-400">Support</span>
                                    <span className="font-medium text-gray-900 dark:text-white">24/7</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Card */}
                        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 text-white text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                                <BusinessCenterIcon sx={{ fontSize: 32 }} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">
                                Ready to Get Started?
                            </h3>
                            <p className="text-white/80 mb-6">
                                Let us help you transform your business with our expert services
                            </p>
                            <Link
                                href="/#contact"
                                className="block w-full py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Contact Us Today
                            </Link>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Have Questions?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Our team is here to help. Reach out for a free consultation.
                            </p>
                            <div className="space-y-3">
                                {companyInfo?.email && (
                                    <a
                                        href={`mailto:${companyInfo.email}`}
                                        className="flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                                    >
                                        {companyInfo.email}
                                    </a>
                                )}
                                {companyInfo?.phone && (
                                    <a
                                        href={`tel:${companyInfo.phone}`}
                                        className="flex items-center text-primary-600 dark:text-primary-400 hover:underline"
                                    >
                                        {companyInfo.phone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Services */}
                {relatedServices.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                            Other Services
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedServices.map((relService) => (
                                <Link
                                    key={relService.id}
                                    href={`/services/${relService.slug}`}
                                    className="group bg-white dark:bg-dark-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2"
                                >
                                    <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 overflow-hidden">
                                        {relService.image_url ? (
                                            <img
                                                src={getImageUrl(relService.image_url)}
                                                alt={relService.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BusinessCenterIcon sx={{ fontSize: 64, color: 'rgba(220, 38, 38, 0.3)' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {relService.name}
                                        </h3>
                                        {relService.short_description && (
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                                                {relService.short_description}
                                            </p>
                                        )}
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

export default ServiceDetail;
