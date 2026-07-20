'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    BookOpenIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';
import FormattedBibTeXText from './FormattedBibTeXText';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
}

export default function PublicationsList({
    config,
    publications,
    embedded = false
}: PublicationsListProps) {
    const messages = useMessages();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(
        null
    );

    // Extract unique years for the filter.
    const years = useMemo(() => {
        const uniqueYears = Array.from(
            new Set(publications.map(publication => publication.year))
        );

        return uniqueYears.sort((a, b) => b - a);
    }, [publications]);

    // Extract unique publication types for the filter.
    const types = useMemo(() => {
        const uniqueTypes = Array.from(
            new Set(publications.map(publication => publication.type))
        );

        return uniqueTypes.sort();
    }, [publications]);

    // Apply the search, year, and type filters.
    const filteredPublications = useMemo(() => {
        return publications.filter(publication => {
            const normalizedSearchQuery = searchQuery.toLowerCase();

            const matchesSearch =
                publication.title
                    .toLowerCase()
                    .includes(normalizedSearchQuery) ||
                publication.authors.some(author =>
                    author.name
                        .toLowerCase()
                        .includes(normalizedSearchQuery)
                ) ||
                publication.journal
                    ?.toLowerCase()
                    .includes(normalizedSearchQuery) ||
                publication.conference
                    ?.toLowerCase()
                    .includes(normalizedSearchQuery);

            const matchesYear =
                selectedYear === 'all' ||
                publication.year === selectedYear;

            const matchesType =
                selectedType === 'all' ||
                publication.type === selectedType;

            return matchesSearch && matchesYear && matchesType;
        });
    }, [
        publications,
        searchQuery,
        selectedYear,
        selectedType
    ]);

    /*
     * PRISM parses BibTeX @unpublished entries as "preprint".
     *
     * Published items are displayed first under the main Publications title.
     * Preprint items are displayed afterward under Works in Progress.
     */
    const displayedPublications = useMemo(() => {
        const publishedItems = filteredPublications.filter(
            publication => publication.type !== 'preprint'
        );

        const worksInProgressItems = filteredPublications.filter(
            publication => publication.type === 'preprint'
        );

        return [
            ...publishedItems,
            ...worksInProgressItems
        ];
    }, [filteredPublications]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="mb-8">
                <h1
                    className={`${
                        embedded ? 'text-2xl' : 'text-4xl'
                    } font-serif font-bold text-primary mb-4`}
                >
                    {config.title}
                </h1>

                {config.description && (
                    <p
                        className={`${
                            embedded ? 'text-base' : 'text-lg'
                        } text-neutral-600 dark:text-neutral-500 max-w-2xl`}
                    >
                        {config.description}
                    </p>
                )}
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />

                        <input
                            type="text"
                            placeholder={
                                messages.publications.searchPlaceholder
                            }
                            value={searchQuery}
                            onChange={event =>
                                setSearchQuery(event.target.value)
                            }
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'flex items-center justify-center px-4 py-2 rounded-lg border transition-all duration-200',
                            showFilters
                                ? 'bg-accent text-white border-accent'
                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-accent hover:text-accent'
                        )}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {messages.publications.filters}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-6">
                                {/* Year Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                        {messages.publications.year}
                                    </label>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() =>
                                                setSelectedYear('all')
                                            }
                                            className={cn(
                                                'px-3 py-1 text-xs rounded-full transition-colors',
                                                selectedYear === 'all'
                                                    ? 'bg-accent text-white'
                                                    : 'bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>

                                        {years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() =>
                                                    setSelectedYear(year)
                                                }
                                                className={cn(
                                                    'px-3 py-1 text-xs rounded-full transition-colors',
                                                    selectedYear === year
                                                        ? 'bg-accent text-white'
                                                        : 'bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                                )}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <BookOpenIcon className="h-4 w-4 mr-1" />
                                        {messages.publications.type}
                                    </label>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() =>
                                                setSelectedType('all')
                                            }
                                            className={cn(
                                                'px-3 py-1 text-xs rounded-full transition-colors',
                                                selectedType === 'all'
                                                    ? 'bg-accent text-white'
                                                    : 'bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>

                                        {types.map(type => (
                                            <button
                                                key={type}
                                                onClick={() =>
                                                    setSelectedType(type)
                                                }
                                                className={cn(
                                                    'px-3 py-1 text-xs rounded-full capitalize transition-colors',
                                                    selectedType === type
                                                        ? 'bg-accent text-white'
                                                        : 'bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                                )}
                                            >
                                                {type.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Publications and Works in Progress */}
            <div className="space-y-6">
                {displayedPublications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.noResults}
                    </div>
                ) : (
                    displayedPublications.map((publication, index) => {
                        const isFirstWorkInProgress =
                            publication.type === 'preprint' &&
                            (
                                index === 0 ||
                                displayedPublications[index - 1].type !==
                                    'preprint'
                            );

                        return (
                            <div key={publication.id}>
                                {isFirstWorkInProgress && (
                                    <h2
                                        className={`${
                                            embedded
                                                ? 'text-2xl'
                                                : 'text-4xl'
                                        } font-serif font-bold text-primary mb-6 mt-14`}
                                    >
                                        Works in Progress
                                    </h2>
                                )}

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.1 * index
                                    }}
                                    className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {publication.preview && (
                                            <div className="w-full md:w-48 flex-shrink-0">
                                                <div className="aspect-video md:aspect-[4/3] relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                                    <Image
                                                        src={`/papers/${publication.preview}`}
                                                        alt={publication.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex-grow">
                                            <h3
                                                className={`${
                                                    embedded
                                                        ? 'text-lg'
                                                        : 'text-xl'
                                                } font-semibold text-primary mb-2 leading-tight`}
                                            >
                                                <FormattedBibTeXText
                                                    nodes={
                                                        publication.titleNodes
                                                    }
                                                    fallback={
                                                        publication.title
                                                    }
                                                />
                                            </h3>

                                            <p
                                                className={`${
                                                    embedded
                                                        ? 'text-sm'
                                                        : 'text-base'
                                                } text-neutral-600 dark:text-neutral-400 mb-2`}
                                            >
                                                {publication.authors.map(
                                                    (
                                                        author,
                                                        authorIndex
                                                    ) => (
                                                        <span key={authorIndex}>
                                                            <span
                                                                className={`${
                                                                    author.isHighlighted
                                                                        ? 'font-semibold text-accent'
                                                                        : ''
                                                                } ${
                                                                    author.isCoAuthor
                                                                        ? `underline underline-offset-4 ${
                                                                              author.isHighlighted
                                                                                  ? 'decoration-accent'
                                                                                  : 'decoration-neutral-400'
                                                                          }`
                                                                        : ''
                                                                }`}
                                                            >
                                                                {author.name}
                                                            </span>

                                                            {author.isCorresponding && (
                                                                <sup
                                                                    className={`ml-0 ${
                                                                        author.isHighlighted
                                                                            ? 'text-accent'
                                                                            : 'text-neutral-600 dark:text-neutral-400'
                                                                    }`}
                                                                >
                                                                    †
                                                                </sup>
                                                            )}

                                                            {authorIndex <
                                                                publication
                                                                    .authors
                                                                    .length -
                                                                    1 &&
                                                                ', '}
                                                        </span>
                                                    )
                                                )}
                                            </p>

                                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-600 mb-3">
                                                {publication.type ===
                                                'preprint'
                                                    ? publication.journal ||
                                                      publication.conference
                                                    : `${
                                                          publication.journal ||
                                                          publication.conference ||
                                                          ''
                                                      } ${
                                                          publication.year
                                                      }`}
                                            </p>

                                            {publication.description && (
                                                <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-4 line-clamp-3">
                                                    {
                                                        publication.description
                                                    }
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2 mt-auto">
                                                {publication.doi && (
                                                    <a
                                                        href={`https://doi.org/${publication.doi}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                                    >
                                                        DOI
                                                    </a>
                                                )}

                                                {publication.code && (
                                                    <a
                                                        href={
                                                            publication.code
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                                    >
                                                        {
                                                            messages
                                                                .publications
                                                                .code
                                                        }
                                                    </a>
                                                )}

                                                {publication.abstract && (
                                                    <button
                                                        onClick={() =>
                                                            setExpandedAbstractId(
                                                                expandedAbstractId ===
                                                                    publication.id
                                                                    ? null
                                                                    : publication.id
                                                            )
                                                        }
                                                        className={cn(
                                                            'inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors',
                                                            expandedAbstractId ===
                                                                publication.id
                                                                ? 'bg-accent text-white'
                                                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white'
                                                        )}
                                                    >
                                                        <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                                        {
                                                            messages
                                                                .publications
                                                                .abstract
                                                        }
                                                    </button>
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {expandedAbstractId ===
                                                    publication.id &&
                                                publication.abstract ? (
                                                    <motion.div
                                                        key="abstract"
                                                        initial={{
                                                            opacity: 0,
                                                            height: 0
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            height: 'auto'
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            height: 0
                                                        }}
                                                        className="overflow-hidden mt-4"
                                                    >
                                                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                                            <p className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">
                                                                {
                                                                    publication.abstract
                                                                }
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ) : null}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
