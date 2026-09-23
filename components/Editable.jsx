'use client';
import { useSiteContent } from './useSiteContent';

export default function Editable({ field, as: Tag = 'span', className = '', children, ...props }) {
  const { content, isEditMode, updateField, mounted } = useSiteContent();
  const value = content[field] ?? children;

  if (!mounted) return <Tag className={className} {...props}>{value}</Tag>;

  if (!isEditMode) {
    return <Tag className={className} {...props}>{value}</Tag>;
  }

  return (
    <Tag
      className={`${className} outline outline-1 outline-orange-300 bg-orange-50/50 rounded px-1`}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => updateField(field, e.currentTarget.textContent)}
      {...props}
    >
      {value}
    </Tag>
  );
}
