import { useState } from "react";
import { storage, db } from "../../../config"; // Ensure Firebase is configured
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

function PdfUpload() {
    const [file, setFile] = useState(null);
    const [formName, setFormName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFormNameChange = (e) => {
        setFormName(e.target.value);
    };

    const handleUpload = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page

        if (!file || !formName) {
            setMessage("Please select a PDF and enter a form name.");
            return;
        }

        setUploading(true);
        setMessage("");

        try {
            // Ensure unique file reference
            const storageRef = ref(storage, `pdfs/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    setMessage("Upload failed: " + error.message);
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    await addDoc(collection(db, "forms"), {
                        formName: formName,
                        pdfLink: downloadURL,
                    });

                    setMessage("Upload Successful!");
                    setUploading(false);
                    setFile(null);
                    setFormName("");
                }
            );
        } catch (error) {
            console.error("Error:", error);
            setMessage("An error occurred.");
            setUploading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleUpload}>
                <input
                    type="text"
                    placeholder="Enter form name"
                    value={formName}
                    onChange={handleFormNameChange}
                />
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload PDF"}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default PdfUpload;
