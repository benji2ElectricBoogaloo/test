
import AWS from 'aws-sdk'
import { NextResponse } from 'next/server';

export async function POST(req: Request){
    const formData = await req.formData();
    let location: string;
    let val
    let s3Key: string;
    console.log(formData)
    formData.forEach((key, value)=> {
      if(key === 's3Key') {
        s3Key = value
      } else {
        val = value
      }
    })

    AWS.config.region = 'eu-west-1'
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      })
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${Math.random()}.jpg`,
        Body: val
      }
        try {
             await s3.upload(params, async (err, data) => {
                if(err) {
                    console.log(err)
                    return NextResponse.json({error: err})
                }
                console.log('S3KEY',s3Key)
                await verifyId(s3Key,data.Location)    
                
              })   
    } catch(err) {
        console.log(err)
        return NextResponse.json({error: err})
    }
}

const verifyId = async (s3KeyId: string, s3KeySelfie: string) => {
    try {
        AWS.config.region = 'eu-west-1'
        const rekognition = new AWS.Rekognition({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        })
        const recognitionParams = {
          QualityFilter: "AUTO",
          SimilarityThreshold: 96,
          SourceImage: { 
             S3Object: { 
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `${Math.random()}.jpg`,
              Body: s3KeySelfie
             }
          },
          TargetImage: { 
             S3Object: { 
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `${Math.random()}.jpg`,
              Body: s3KeyId
             }
          }
       }

        await rekognition.compareFaces(recognitionParams, (err, res)=> {
          if(err){
              console.error(err)
              return new Response(JSON.stringify({error: err}), {status: 500})
          }
          if(res.FaceMatches && (res.FaceMatches?.length > 1 || res.FaceMatches?.length < 1 )) {
            return new Response(JSON.stringify({error: "incorrect, try again"}), {status: 500})
          }
          if(res.FaceMatches && res.FaceMatches?.length === 1) {
            return new Response(JSON.stringify({marched: true}), {status: 500})
          }
          })
} catch(err) {
  console.log(err)
  return new Response(JSON.stringify({error: err}), {status: 500})
}
}