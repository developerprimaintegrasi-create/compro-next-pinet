import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShareIcon from '@mui/icons-material/Share';
import { newsAPI } from '@/api/apiService';
import { getImageUrl, parseJSON } from '@/utils/imageUtils';
import { format } from 'date-fns';
import Loading from '@/components/Loading';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const NewsDetail = ({ companyInfo, currentSlug }) => {
    const { slug: paramSlug } = useParams();
    const router = useRouter();
    const slug = currentSlug || paramSlug;
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedNews, setRelatedNews] = useState([]);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await newsAPI.getBySlug(slug);
                setNews(response.data);

                // Fetch related news
                if (response.data?.category) {
                    const allNews = await newsAPI.getAll();
                    const related = allNews.data
                        .filter(n => n.category === response.data.category && n.slug !== slug && n.is_published)
                        .slice(0, 3);
                    setRelatedNews(related);
                }
            } catch (err) {
                setError('News not found');
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [slug]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    if (loading) return <Loading fullScreen />;

    if (error || !news) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">News article not found</p>
                    <button onClick={() => router.push('/')} className="btn-primary">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const gallery = parseJSON(news.gallery, []);
    const allImages = news.featured_image ? [news.featured_image, ...gallery] : gallery;
    const tags = news.tags ? news.tags.split(',').map(t => t.trim()) : [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
            <Navbar companyInfo={companyInfo} />

            {/* Hero Section */}
            <div className="relative pt-20">
                {/* Featured Image */}
                <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                    {allImages.length > 0 ? (
                        <img
                            src={getImageUrl(allImages[activeImage])}
                            alt={news.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex items-end">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
                            {/* Back Button */}
                            <Link
                                href="/#news"
                                className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors group"
                            >
                                <ArrowBackIcon className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to News
                            </Link>

                            {/* Category & Featured */}
                            <div className="flex items-center gap-3 mb-4">
                                {news.category && (
                                    <Chip
                                        label={news.category}
                                        sx={{
                                            backgroundColor: 'rgba(220, 38, 38, 0.9)',
                                            color: 'white',
                                            fontWeight: 600,
                                        }}
                                    />
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                                {news.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-white/80">
                                <span className="flex items-center gap-2">
                                    <CalendarTodayIcon fontSize="small" />
                                    {formatDate(news.published_date)}
                                </span>
                                {news.author && (
                                    <span className="flex items-center gap-2">
                                        <PersonIcon fontSize="small" />
                                        {news.author}
                                    </span>
                                )}
                                {news.views > 0 && (
                                    <span className="flex items-center gap-2">
                                        <VisibilityIcon fontSize="small" />
                                        {news.views} views
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Thumbnails */}
                {allImages.length > 1 && (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                        <div className="flex gap-2 overflow-x-auto pb-4">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx
                                        ? 'border-primary-500 ring-2 ring-primary-500/50'
                                        : 'border-white/50 hover:border-white'
                                        }`}
                                >
                                    <img
                                        src={getImageUrl(img)}
                                        alt={`${news.title} ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Excerpt */}
                {news.excerpt && (
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-medium border-l-4 border-primary-500 pl-6">
                        {news.excerpt}
                    </p>
                )}

                {/* Main Content */}
                <div className="bg-white dark:bg-dark-900 rounded-3xl p-8 md:p-12 shadow-xl mb-8">
                    <article
                        className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-primary-600"
                        dangerouslySetInnerHTML={{ __html: news.content }}
                    />
                </div>

                {/* Tags & Share */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-gray-200 dark:border-dark-700">
                    {tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <LocalOfferIcon className="text-gray-400" fontSize="small" />
                            {tags.map((tag, idx) => (
                                <Chip
                                    key={idx}
                                    label={tag}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                        color: '#dc2626',
                                        fontWeight: 500,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => navigator.share?.({ title: news.title, url: window.location.href })}
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        <ShareIcon fontSize="small" />
                        Share
                    </button>
                </div>
            </div>

            {/* Related News */}
            {relatedNews.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        Related Articles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedNews.map((item) => (
                            <Link
                                key={item.id}
                                href={`/news/${item.slug}`}
                                className="group bg-white dark:bg-dark-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2"
                            >
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={getImageUrl(item.featured_image)}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        {formatDate(item.published_date)}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <Footer companyInfo={companyInfo} />
        </div>
    );
};

export default NewsDetail;
