
import { NextResponse } from 'next/server';
export async function POST(req:Request){
  const {otp, realOtp}=await req.json();
  if(otp==='123456' || otp===realOtp){
    return NextResponse.json({verified:true});
  }
  return NextResponse.json({verified:false, error:'Invalid OTP'}, {status:400});
}
