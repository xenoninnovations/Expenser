import React, { useState, useEffect, useCallback } from 'react';
import { getStorage, ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import AddPDF from '../AddPDF/AddPDF';
import FillForm from '../FillForm/FillForm';
import './UploadPDF.css';

function UploadPDF() {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddPDF, setShowAddPDF] = useState(false);
    const [selectedPDF, setSelectedPDF] = useState(null);
    const [showFillForm, setShowFillForm] = useState(false);
    const [deleteProgress, setDeleteProgress] = useState(null);
    const [fetchProgress, setFetchProgress] = useState(0);

    // Memoize the fetch function to prevent unnecessary re-renders
    const fetchPdfs = useCallback(async () => {
        setLoading(true);
        setFetchProgress(0);
        setError(null);

        try {
            console.log('=== CLIENT: Starting PDF Fetch ===');
            const storage = getStorage();
            const db = getFirestore();

            // Start both operations in parallel
            const [storageResult, firestoreResult] = await Promise.all([
                // Fetch from Firebase Storage
                (async () => {
                    console.log('Fetching from Firebase Storage...');
                    const listRef = ref(storage, 'pdfs');
                    const result = await listAll(listRef);
                    setFetchProgress(50);
                    return result.items;
                })(),

                // Fetch from Firestore
                (async () => {
                    console.log('Fetching from Firestore...');
                    const querySnapshot = await getDocs(collection(db, 'pdfs'));
                    setFetchProgress(50);
                    return querySnapshot.docs;
                })()
            ]);

            // Combine the results
            const pdfList = await Promise.all(
                storageResult.map(async (item) => {
                    try {
                        const url = await getDownloadURL(item);
                        const firestoreDoc = firestoreResult.find(doc => doc.data().url === url);

                        return {
                            id: firestoreDoc?.id || item.name,
                            name: item.name,
                            url: url,
                            formFields: firestoreDoc?.data()?.formFields || [],
                            uploadedAt: firestoreDoc?.data()?.uploadedAt || new Date().toISOString()
                        };
                    } catch (error) {
                        console.error(`Error processing PDF ${item.name}:`, error);
                        return null;
                    }
                })
            );

            // Filter out any null entries and sort by upload date
            const validPdfs = pdfList
                .filter(pdf => pdf !== null)
                .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

            setPdfs(validPdfs);
            setFetchProgress(100);
            console.log('=== CLIENT: PDF Fetch Complete ===');
        } catch (error) {
            console.error('=== CLIENT ERROR: PDF Fetch ===', error);
            setError('Failed to load PDFs. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPdfs();
    }, [fetchPdfs]);

    const handleDelete = async (pdf) => {
        if (!window.confirm(`Are you sure you want to delete ${pdf.name}?`)) {
            return;
        }

        // Prevent multiple delete operations
        if (deleteProgress) {
            return;
        }

        const startTime = Date.now();
        setDeleteProgress({ id: pdf.id, status: 'Starting deletion...' });

        try {
            const storage = getStorage();
            const db = getFirestore();

            // First delete from Storage
            setDeleteProgress(prev => ({ ...prev, status: 'Deleting from storage...' }));
            const fileRef = ref(storage, `pdfs/${pdf.name}`);
            await deleteObject(fileRef);

            // Then delete from Firestore
            setDeleteProgress(prev => ({ ...prev, status: 'Deleting from database...' }));
            await deleteDoc(doc(db, 'pdfs', pdf.id));

            // Finally update UI
            const totalTime = Date.now() - startTime;
            setDeleteProgress(prev => ({ ...prev, status: `Completed in ${totalTime}ms` }));

            // Update the PDFs list after successful deletion
            setPdfs(prevPdfs => prevPdfs.filter(p => p.id !== pdf.id));

            // Clear progress after a delay
            setTimeout(() => {
                setDeleteProgress(null);
            }, 1000);
        } catch (error) {
            console.error('Delete operation failed:', error);
            setError('Failed to delete PDF. Please try again.');
            setDeleteProgress(null);
        }
    };

    return (
        <div className="upload-pdf-page">
            <div className="upload-pdf-header">
                <h1>PDF Forms</h1>
                <button onClick={() => setShowAddPDF(true)} className="add-pdf-button">
                    Add PDF
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)} className="close-error">×</button>
                </div>
            )}

            {loading ? (
                <div className="loading-container">
                    <div className="loading-progress">
                        <div
                            className="progress-bar"
                            style={{ width: `${fetchProgress}%` }}
                        />
                    </div>
                    <div className="loading-text">
                        {fetchProgress < 50 ? 'Loading PDFs...' :
                            fetchProgress < 100 ? 'Processing PDFs...' :
                                'Complete!'} {fetchProgress}%
                    </div>
                </div>
            ) : pdfs.length === 0 ? (
                <div className="no-pdfs">
                    <p>No PDFs uploaded yet. Click "Add PDF" to get started.</p>
                </div>
            ) : (
                <div className="pdf-list">
                    {pdfs.map((pdf) => (
                        <div key={pdf.id} className="pdf-item">
                            <div className="pdf-info">
                                <h3>{pdf.name}</h3>
                                <p>Uploaded: {new Date(pdf.uploadedAt).toLocaleString()}</p>
                            </div>
                            <div className="pdf-actions">
                                {deleteProgress?.id === pdf.id ? (
                                    <div className="delete-progress">
                                        <div
                                            className="progress-bar"
                                            style={{ width: '100%' }}
                                        />
                                        <span>{deleteProgress.status}</span>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setSelectedPDF(pdf);
                                                setShowFillForm(true);
                                            }}
                                            className="fill-form-button"
                                            disabled={!!deleteProgress}
                                        >
                                            Fill Form
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pdf)}
                                            className="delete-button"
                                            disabled={!!deleteProgress}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddPDF && (
                <AddPDF
                    closeModal={() => setShowAddPDF(false)}
                    refreshUploadPDF={fetchPdfs}
                />
            )}

            {showFillForm && selectedPDF && (
                <FillForm
                    closeModal={() => {
                        setShowFillForm(false);
                        setSelectedPDF(null);
                    }}
                    pdfData={selectedPDF}
                />
            )}
        </div>
    );
}

export default UploadPDF; 