import React, { type FormEvent } from 'react'
import Navbar from '~/components/Navbar'
import {useState} from 'react'
import { usePuterStore } from '~/lib/puter'
import FileUploader from '~/components/FileUploader'
import { useNavigate } from 'react-router'
import { convertPdfToImage } from '~/lib/pdf2img'
import { generateUUID } from '~/lib/utils'
import { prepareInstructions } from 'constants/index'


const Upload = () => {
  const {auth, isLoading, fs, ai, kv} = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const [statusText, setStatusText] = useState('Processing your resume...');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }

  const handleAnalyze = async ({companyName, jobTitle, jobDescription, file}: {companyName: string; jobTitle: string; jobDescription: string; file: File}) => {
    setIsProcessing(true);
    setStatusText('Uploading your resume...');
    const uploadedFile = await fs.upload([file]);

    if(!file) return setStatusText('Error: Failed to upload file.');
    setStatusText('Converting to image...');
    const imageFile = await convertPdfToImage(file);
    if(!imageFile.file) {
      return setStatusText('Error: Failed to convert PDF to image.');
    }
    setStatusText('Uploading image...');
    const uploadedImage = await fs.upload([imageFile.file]);
    if(!uploadedImage) {
      return setStatusText('Error: Failed to upload image.');
    }   
    setStatusText('Analyzing resume...');

    const uuid = generateUUID();

    const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: '',
    }

    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText('Generating feedback...');

    const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({jobTitle, jobDescription})
    )
    
    if(!feedback) {
      return setStatusText('Error: Failed to generate feedback.');
    }

    const feedbackText = typeof feedback.message.content === 'string' 
        ? feedback.message.content 
        : feedback.message.content[0].text;
    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText('AI Analysis Complete!');
    console.log('AI Analysis Result:', data);
  }
    
  

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if(!form){
        return;
    }
    const formData = new FormData(form);
    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;

    console.log('Company Name:', companyName);
    console.log('Job Title:', jobTitle);    
    console.log('Job Description:', jobDescription);
    console.log('File:', file);

    if (!file) {
      alert('Please upload a resume file.');
      return;
    }

    handleAnalyze({companyName, jobTitle, jobDescription, file});

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