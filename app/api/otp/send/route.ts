
import { NextResponse } from 'next/server';
// TODO: Real OTP - setup Twilio
// 1. npm install twilio
// 2. Vercel ENV: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
// 3. Uncomment below
/*
import Twilio from 'twilio';
const client = Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
export async function POST(req:Request){
  const {phone}=await req.json();
  const otp=Math.floor(100000+Math.random()*900000).toString();
  await client.messages.create({body:`Buddy Blind OTP: ${otp}`, from:process.env.TWILIO_PHONE_NUMBER!, to:phone});
  return NextResponse.json({sent:true, otp}); // In production, don't return otp, store in DB
}
*/
// DEV MODE - no Twilio needed, use 123456
export async function POST(req:Request){
  const {phone}=await req.json();
  const otp=Math.floor(100000+Math.random()*900000).toString();
  console.log(`DEV OTP for ${phone}: ${otp} - Use 123456 to bypass`);
  return NextResponse.json({sent:true, devOtp: otp, message:'DEV MODE - Use 123456'});
}
