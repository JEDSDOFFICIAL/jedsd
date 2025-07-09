"use client";

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const ReviewerAcceptancy = () => {
    const searchParams = useSearchParams();
    const paperId = searchParams.get('paperId');
    const reviewerId = searchParams.get('reviewerId');
    const action = searchParams.get('action');

    const [statusMessage, setStatusMessage] = useState('Processing your request...');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const handleAction = async () => {
            // First, validate the query parameters.
            if (!paperId || !reviewerId || (action !== 'accept' && action !== 'reject')) {
                setStatusMessage('Invalid request. Please check the link.');
                setIsError(true);
                return;
            }

            try {
                if (action === 'accept') {
                    // Action is 'accept'
                    await axios.post(`/api/paper?paperId=${paperId}`, {
                        reviewerId: reviewerId,
                        reviewerStatus: 'ACCEPTED_FOR_REVIEW',
                        status: 'ON_REVIEW'
                    });
                    setStatusMessage('Thank you! Your acceptance to review the paper has been confirmed.');
                } else if (action === 'reject') {
                    // Action is 'reject'
                    await axios.post(`/api/paper?paperId=${paperId}`, {
                        reviewerId: reviewerId,
                        reviewerStatus: 'REJECTED_FOR_REVIEW',
                        status: 'REVIEWER_ALLOCATION'
                    });
                    setStatusMessage('You have successfully rejected the review request. The editor has been notified.');
                }
            } catch (error) {
                console.error('Error updating review status:', error);
                setStatusMessage('There was an error processing your request. Please try again later.');
                setIsError(true);
            }
        };

        handleAction();
    }, [paperId, reviewerId, action]);

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
            <div style={{
                padding: '2rem',
                borderRadius: '8px',
                backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${isError ? '#ef4444' : '#22c55e'}`,
                color: isError ? '#ef4444' : '#16a34a'
            }}>
                <h1 style={{ margin: '0 0 1rem', fontSize: '2rem' }}>Review Status</h1>
                <p style={{ margin: '0', fontSize: '1.1rem' }}>{statusMessage}</p>
            </div>
        </div>
    );
};

import { Suspense } from 'react';

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReviewerAcceptancy />
        </Suspense>
    );
}