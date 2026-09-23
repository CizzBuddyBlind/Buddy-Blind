'use client';
import { useSiteContent } from '@/lib/useSiteContent';
import { useState } from 'react';
type ProfileData = { name: string; location: string; };
const DEFAULT = { profileName: 'CJ' };
export default function ProfilePage(){
  const { getText, getStyle, content } = useSiteContent(DEFAULT) as any;
  const [profile,setProfile]=useState<ProfileData>({ name:'CJ', location:'CENTRAL' });
  return <div className="p-10"><h1>{getText('profileName', profile.name)}</h1><p>{profile.location}</p></div>
}
