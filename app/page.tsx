"use client"
import { useState } from 'react'
import Image from 'next/image'
import { match } from 'assert';



export default function Home() {
  const [selectedImage, setSelectedImage] = useState("");;
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isId, setIsId] = useState(false);
  const [s3Key, setS3Key] = useState("");
  const [matched, setMatched] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    if(!selectedFile) {
      return
    }
    const formData = new FormData();

    formData.append(selectedImage, selectedFile);
    if(isId) {
      formData.append("s3Key", s3Key);
    }
    fetch(`api/${isId ? 'uploadSelfie' : 'uploadId'}`, {
      method: 'POST',
      body: formData,
    }).then((res) => {
      console.log(res)
      return res.json()
    }).then(data=> {
      console.log(data)
      if(data.isId){
        setIsId(data.isId)
        setS3Key(data.IdUrl)
      } 
      if(matched) setMatched(matched)
      setSelectedImage("")
      setSelectedFile(undefined);
    })
    setUploading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <label>
      <input 
      type='file' 
      hidden 
      onChange={({target}) => {
        if(target.files) {
          const file = target.files[0]
          setSelectedImage(URL.createObjectURL(file));
          setSelectedFile(file);
        }
      }}
      />
        <div className="w-40 aspect-video rounded flex items-center justify-center border-2 border-dashed cursor-pointer">
            {
              selectedImage? (<Image src={selectedImage} width='100' height='100' alt="" />) : (<span>select image</span>)
            }
        </div>
      </label>
      <button 
      disabled={uploading} 
      style={{opacity: uploading ? "0.5" : "1"}} 
      className="bg-red-600 p-3 w-32 text-center rounded ext-white"
      onClick={handleUpload}>
        {uploading ? "Uploading..." : isId? "Upload Selfie" : "Upload Id Doc"}
      </button>
      {matched ? <div>you are verified!</div> : ''}
    </main>
  )
}
