'use client';
import EditableText from '@/components/EditableText';
export default function FounderPage() {
  return <main className="p-10"><h1 className="text-3xl"><EditableText field="profileName" as="span" /> — <EditableText field="profileRole" as="span" /></h1><p className="mt-4 opacity-70">Founder edit mode works here too.</p></main>
}
