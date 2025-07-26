import React, { type FormEvent } from 'react'
import Navbar from '~/components/Navbar'
import {useState} from 'react'
import { usePuterStore } from '~/lib/puter'
import FileUploader from '~/components/FileUploader'

const Upload = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const [statusText, setStatusText] = useState('Processing your resume...');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if(!form){
        return;
    }
    const formData = new FormData(form);
    const companyName = formData.get('company-name');
    const jobTitle = formData.get('job-title');
    const jobDescription = formData.get('job-description');

    console.log('Company Name:', companyName);
    console.log('Job Title:', jobTitle);    
    console.log('Job Description:', jobDescription);
    console.log('File:', file);

    if (!file) {
      alert('Please upload a resume file.');
      return;
    }
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className='page-heading py-16'>
            <h1>Smart feedback for your dream job</h1>
            {isProcessing ? (
                <>
                    <h2>{statusText}</h2>
                    <img src='/images/resume-scan.gif' className="w-full"/>
                </>
            ) : (
                <h2>Upload your resume to get AI-powered feedback</h2>
            )}
            {!isProcessing && (
                <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">

                    <div className='form-div'>
                        <label htmlFor="company-name">Company Name</label>
                        <input type="text" id="company-name" name="company-name" placeholder="Enter the Company's Name" required />
                    </div>

                    <div className='form-div'>
                        <label htmlFor="job-title">Job Title</label>
                        <input type="text" id="job-title" name="job-title" placeholder="Enter the Job Title" required />
                    </div>

                    <div className='form-div'>
                        <label htmlFor="job-description">Job Description</label>
                        <textarea rows={5} id="job-description" name="job-description" placeholder="Enter the Job Description" required />
                    </div>

                    <div className='form-div'>
                        <label htmlFor="uploader">Upload Resume</label>
                        <FileUploader onFileSelect={handleFileSelect} />
                    </div>

                    <button className="primary-button" type="submit">
                        Analyze Resume
                    </button>


                </form>
            )}
        </div>
      </section>
    </main>
  )
}

export default Upload