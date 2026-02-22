import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'PromptCraft';
const DEFAULT_DESCRIPTION =
    'Create professional-grade AI prompts for Midjourney, ChatGPT, Runway, Stable Diffusion, and more. Transform your ideas into optimized prompts instantly.';
const DEFAULT_IMAGE = '/og-image.png';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article';
    noIndex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    type = 'website',
    noIndex = false,
}) => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    return (
        <Helmet>
            {/* Basic */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noIndex && <meta name="robots" content="noindex,nofollow" />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            {image && <meta property="og:image" content={image} />}
            <meta property="og:site_name" content={SITE_NAME} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
};
