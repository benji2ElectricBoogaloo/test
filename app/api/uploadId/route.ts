
import AWS from 'aws-sdk'
import { NextResponse } from 'next/server';

export async function POST(req: Request){
    const formData = await req.formData();
    let location: string;
    let val

    formData.forEach((key, value)=> {
        val = value
    })
    AWS.config.region = 'eu-west-1'
    console.log(process.env.AWS_ACCESS_KEY_ID)
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
                console.log(data)
                await verifyId(data.Location)    
                
              })   
    } catch(err) {
        console.log(err)
        return NextResponse.json({error: err})
    }
}

const verifyId = async (s3Key: string) => {
    try {
        console.log(s3Key)
        AWS.config.region = 'eu-west-1'
        const rekognition = new AWS.Rekognition({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        })
        const recognitionParams = {
          Image: {
            S3Object: {
              Bucket: process.env.AWS_BUCKET_NAME,
              Name: s3Key,
            },
          },
          MaxLabels: 10
        }

        await rekognition.detectLabels(recognitionParams, (err, res)=> {
          if(err){
              console.error(err)
              return new Response(JSON.stringify({error: err}), {status: 500})
          }
          res.Labels?.forEach(label => {
              console.log(label)
              if(label.Name === "Id Cards") {
                  return new Response( JSON.stringify({isId: true, IdUrl: location}), {status: 200})
              }
          })
        })
} catch(err) {
  console.log(err)
  return new Response(JSON.stringify({error: err}), {status: 500})
}
}