import React, { useState, useEffect } from 'react';

// Section Components
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ServicesSection from '@/components/sections/ServicesSection';
import ValuesSection from '@/components/sections/ValuesSection';
import StatsSection from '@/components/sections/StatsSection';
import ProductsSection from '@/components/sections/ProductsSection';
import PartnersSection from '@/components/sections/PartnersSection';
import ClientsSection from '@/components/sections/ClientsSection';
import NewsSection from '@/components/sections/NewsSection';
import EventsSection from '@/components/sections/EventsSection';
import ContactSection from '@/components/sections/ContactSection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import SocialMediaWidget from '@/components/SocialMediaWidget';
import Loading from '@/components/Loading';

// API Services
import {
    companyAPI,
    heroAPI,
    serviceAPI,
    valueAPI,
    productAPI,
    partnerAPI,
    clientAPI,
    newsAPI,
    eventAPI,
} from '@/api/apiService';

const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        companyInfo: null,
        heroes: [],
        services: [],
        values: [],
        products: [],
        partners: [],
        clients: [],
        news: [],
        events: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [
                    companyRes,
                    heroesRes,
                    servicesRes,
                    valuesRes,
                    productsRes,
                    partnersRes,
                    clientsRes,
                    newsRes,
                    eventsRes,
                ] = await Promise.all([
                    companyAPI.getInfo().catch(() => ({ data: null })),
                    heroAPI.getAll().catch(() => ({ data: [] })),
                    serviceAPI.getAll().catch(() => ({ data: [] })),
                    valueAPI.getAll().catch(() => ({ data: [] })),
                    productAPI.getAll().catch(() => ({ data: [] })),
                    partnerAPI.getAll().catch(() => ({ data: [] })),
                    clientAPI.getAll().catch(() => ({ data: [] })),
                    newsAPI.getAll().catch(() => ({ data: [] })),
                    eventAPI.getAll().catch(() => ({ data: [] })),
                ]);

                setData({
                    companyInfo: companyRes.data,
                    heroes: Array.isArray(heroesRes.data) ? heroesRes.data : [],
                    services: Array.isArray(servicesRes.data) ? servicesRes.data : [],
                    values: Array.isArray(valuesRes.data) ? valuesRes.data : [],
                    products: Array.isArray(productsRes.data) ? productsRes.data : [],
                    partners: Array.isArray(partnersRes.data) ? partnersRes.data : [],
                    clients: Array.isArray(clientsRes.data) ? clientsRes.data : [],
                    news: Array.isArray(newsRes.data) ? newsRes.data : [],
                    events: Array.isArray(eventsRes.data) ? eventsRes.data : [],
                });
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px',
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeIn');
                }
            });
        }, observerOptions);

        // Observe all sections after a short delay to ensure DOM is ready
        setTimeout(() => {
            const sections = document.querySelectorAll('section');
            sections.forEach((section) => observer.observe(section));
        }, 100);

        return () => observer.disconnect();
    }, []);

    if (loading) {
        return <Loading fullScreen />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                        Oops!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar companyInfo={data.companyInfo} />

            <main>
                <HeroSection heroes={data.heroes} />
                <AboutSection companyInfo={data.companyInfo} />
                <StatsSection companyInfo={data.companyInfo} />
                <ServicesSection services={data.services} />
                <ValuesSection values={data.values} />
                <ProductsSection products={data.products} />
                <PartnersSection partners={data.partners} />
                <ClientsSection clients={data.clients} />
                <NewsSection news={data.news} />
                <EventsSection events={data.events} />
                <ContactSection companyInfo={data.companyInfo} />
            </main>

            <Footer companyInfo={data.companyInfo} />
            <ScrollToTop />
            <SocialMediaWidget companyInfo={data.companyInfo} />
        </>
    );
};

export default HomePage;
