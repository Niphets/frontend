import React, { useState, useEffect } from 'react';
import "../style/document.css";

function Document() {
  const [applicant_name, setApplicant_name] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(''); // "pending", "uploading", "completed"
  const [showAddButton, setShowAddButton] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileStatus, setFileStatus] = useState({});

  // Handle input change for applicant name
  const handleNameChange = (e) => {
    setApplicant_name(e.target.value);
  };


  // Handle input change for document name
  const handleDocumentNameChange = (e) => {
    setDocumentName(e.target.value);
  };

  const handleSaveApplicant = async () => {
    if (applicant_name.trim() === '') return;
    if (applicants.find((app) => app.applicant_name === applicant_name)) {
      alert('Applicant name already exists.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BaseUrl}/api/applicants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_name }),
      });

      if (response.ok) {
        setApplicant_name('');
        setShowAddButton(true);

        // Fetch updated list of applicants
        const updatedResponse = await fetch(`${process.env.REACT_APP_BaseUrl}/api/applicants`);
        if (updatedResponse.ok) {
          const updatedApplicants = await updatedResponse.json();
          setApplicants(updatedApplicants);
        }

        // Close the modal
        const modal = document.getElementById('addApplicantModal');
        if (modal) {
          const modalInstance = window.bootstrap.Modal.getInstance(modal);
          modalInstance.hide();
        }


      } else {
        alert('Error adding applicant: ' + response.statusText);
      }
    } catch (error) {
      alert('Error adding applicant: ' + error.message);
    }
  };





  // Function to open the modal when "Add" is clicked (Does NOT save anything yet)
  const handleAddDocument = () => {
    setDocumentName('');
    const modal = document.getElementById('addDocumentModal');
    const modalInstance = new window.bootstrap.Modal(modal);
    modalInstance.show();
  };
  // Function to save the document name when "Save" is clicked
  
  const handleSaveDocument = () => {
    if (!documentName.trim()) {
      alert("Please enter a document name before saving.");
      return;
    }

    const updatedDocuments = [...documents, documentName];
    setDocuments(updatedDocuments);
    setActiveDoc(documentName);
    setDocumentName('');

    // Save to localStorage
    localStorage.setItem('documents', JSON.stringify(updatedDocuments));

    const modal = document.getElementById('addDocumentModal');
    const modalInstance = window.bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
  };



  // Handle selecting a document
  const handleSelectDocument = (doc) => {
    setActiveDoc(doc);
  };

  const handleChooseFile = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setUploadStatus('pending'); // Set status to pending after file selection
  };

  //handle remove file
  const handleRemoveFile = (fileName) => {
    const updatedFiles = selectedFiles.filter((file) => file.name !== fileName);
    setSelectedFiles(updatedFiles);

    const updatedStatus = { ...fileStatus };
    delete updatedStatus[fileName];
    setFileStatus(updatedStatus); // Remove status of the deleted file
  };

  // Handle cancel action
  const handleCancel = () => {
    setSelectedFiles([]);
    setUploadStatus('');
  };

  // Handle file drop action (for drag and drop)
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleBack = () => {
    setActiveDoc(null); // Reset the active document to hide the document section
  };

  const handleNext = () => {
    if (uploadStatus !== 'completed') {
      alert('Upload not completed. Please complete the upload before proceeding.');
      return;
    }
    alert('Action saved successfully!');
    // Proceed with your next step here (e.g., navigation or another action)
  };


  const handleUploadFile = async () => {
    if (selectedFiles.length === 0 || !activeDoc) return;
    setUploadStatus('uploading');
    const formData = new FormData();

    selectedFiles.forEach((file) => {
      const applicant = applicants.find((app) => app.name === activeDoc);
      console.log('Active Document:', activeDoc);
      console.log('Applicant Found:', applicant);
      formData.append('document', file);

      // Make sure to use 'user_id' here to match the backend
      if (applicant?.id) {
        formData.append('user_id', applicant.id);  // Changed from 'applicant_id' to 'user_id'
      } else {
        console.warn('User ID is missing!');
      }
      formData.append('document_name', file.name);
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_BaseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('completed');
        alert('Upload successful!');
      } else {
        const errorData = await response.text();
        console.error('Upload failed:', errorData);
        alert('Upload failed: ' + errorData);
        setUploadStatus('pending');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('An error occurred during upload.');
      setUploadStatus('pending');
    }
  };

  // Handle deleting a specific applicant name
  const handleDeleteApplicant = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BaseUrl}/api/applicants/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update the state immediately after deletion
        setApplicants((prevApplicants) =>
          prevApplicants.filter((applicant) => applicant.id !== id)
        );
        console.log('Applicant deleted successfully!');
      } else {
        console.error('Error deleting applicant:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting applicant:', error.message);
    }
  };

  // Fetch applicants from the server on component mount
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BaseUrl}/api/applicants`);
        if (response.ok) {
          const data = await response.json();
          setApplicants(data);
        } else {
          console.error('Error fetching applicants:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching applicants:', error);
      }
    };

    fetchApplicants();

    // Load documents from localStorage
    const storedDocuments = localStorage.getItem('documents');
    if (storedDocuments) {
      setDocuments(JSON.parse(storedDocuments));
    }
  }, []);
  const formData = new FormData();
  selectedFiles.forEach((file) => formData.append("files", file));
  return (
    <>
      <div className="container-fluid mt-4 mb-5">
        <div className="card">
          <div className="card-body mb-5">
            <div className="row d-flex align-items-center mt-4 mb-2 pb-2">
              <div className="col p-3 m-2">
                <h2 className="fw-bold" style={{ fontSize: '2rem' }}>Document Upload</h2>
              </div>
              <div className="col text-end">
                <button
                  className="btn btn-primary rounded pt-3 pb-3 px-4 py-2 fw-bold"
                  data-bs-toggle="modal"
                  data-bs-target="#addApplicantModal"
                >
                  + Add Applicant
                </button>
              </div>
            </div>
            {applicants.length > 0 && (
              <div className="row d-flex justify-content-start align-items-center mb-4">
                {applicants.map((applicant) => (
                  <div key={applicant.id} className="col-auto mb-2 d-flex align-items-center gap-2 applicant-item">
                    <p className="sp fw-bold text-primary">{applicant.applicant_name}</p>
                    <button
                      className="btn btn-primary delete-btn"
                      onClick={() => handleDeleteApplicant(applicant.id)}
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <hr className="mb-4" />

            {applicants && documents.length === 0 && (
              <div className="row d-flex justify-content-center">
                <p className="dp">No documents available</p>
              </div>
            )}

            <div className="row">
              {showAddButton && (
                <div className="col-auto col-1 mt-3">
                  <div>
                    {documents.map((doc) => (
                      <button
                        key={doc}
                        className={`btn btn-primary rounded mb-2 d-flex flex-column gap-3 ${activeDoc === doc ? 'active' : ''}`}
                        onClick={() => handleSelectDocument(doc)}
                      >
                        {doc}
                      </button>
                    ))}
                    <div>
                      <button
                        className="btn btn-primary fw-bold rounded ps-4 pe-4"
                        onClick={handleAddDocument}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeDoc && (
                <div className="col-auto col-11">
                  <div className="card p-3 shadow-sm">
                    <div className="d-flex justify-content-start gap-2 mb-3">
                      <label className="btn btn-primary">
                        <i className="bi bi-plus-lg"></i> Choose
                        <input
                          type="file"
                          multiple
                          style={{ display: 'none' }}
                          onChange={handleChooseFile}
                        />
                      </label>

                      <button
                        className={`btn ${uploadStatus === 'uploading' ? 'btn-success' : uploadStatus === 'completed' ? 'btn-secondary' : 'btn-info'} text-white`}
                        onClick={handleUploadFile}
                        disabled={uploadStatus === 'uploading' || selectedFiles.length === 0}
                      >
                        {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'completed' ? 'Completed' : 'Upload'}
                      </button>

                      <button
                        className="btn btn-light border"
                        onClick={handleCancel}
                        disabled={uploadStatus === 'uploading'}
                      >
                        Cancel
                      </button>

                      {uploadStatus && (
                        <div className="mt-2">
                          <span className={`badge ${uploadStatus === 'completed' ? 'bg-success' : 'bg-warning'} text-white`}>
                            {uploadStatus === 'pending' ? 'Pending' : uploadStatus === 'completed' ? 'Completed' : 'Uploading...'}
                          </span>
                        </div>
                      )}
                    </div>


                    {/* Display Selected Files */}
                    <div className="mt-3">

                      {selectedFiles.length > 0 ? (
                        selectedFiles.map((file) => (
                          <div key={file.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '8px' }}
                            />
                            <div>
                              <p>{file.name}</p>
                              <p>{(file.size / 1024).toFixed(3)} KB</p>
                              <span style={{ color: 'orange', fontWeight: 'bold' }}>{fileStatus[file.name]}</span>
                            </div>
                            <button onClick={() => handleRemoveFile(file.name)} style={{ color: 'red', marginLeft: '8px' }}>
                              ❌
                            </button>
                          </div>
                        ))
                      ) : (
                        <div
                          className="border rounded p-4 text-center bg-light"
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          style={{ minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          Drag and Drop files here.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="row d-flex mt-4">
              <div className="col">
                <button className="btn btn-primary rounded px-4 py-2 fw-bold" onClick={handleBack}>← Back</button>
              </div>
              <div className="col text-end">
                <button className="btn btn-primary rounded px-4 py-2 fw-bold" onClick={handleNext} >Next →</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Applicant Modal */}
      <div className="modal fade" id="addApplicantModal" tabIndex="-1" aria-labelledby="addApplicantLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="addApplicantLabel">Add Applicant</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <label className="form-label">Name</label>
              <input
                type="text"
                name='applicant_name'
                className="form-control"
                placeholder="Enter applicant name"
                value={applicant_name}
                onChange={handleNameChange}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary fw-bold" onClick={handleSaveApplicant}>✔ Save</button>
              <button className="btn btn-secondary fw-bold" data-bs-dismiss="modal">✖ Cancel</button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Document Modal */}
      <div className="modal fade" id="addDocumentModal" tabIndex="-1" aria-labelledby="addDocumentLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Add Document</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <label className="form-label">Document Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter document name"
                value={documentName}
                onChange={handleDocumentNameChange}
              />

            </div>
            <div className="modal-footer">
              <button className="btn btn-primary fw-bold" onClick={handleSaveDocument}>✔ Save</button>
              <button className="btn btn-secondary fw-bold" data-bs-dismiss="modal">✖ Cancel</button>
            </div>
          </div>
        </div>

      </div>

    </>
  );
}

export default Document;                                                                                                                    