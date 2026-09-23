'use client';
import { useSiteContent } from '@/lib/useSiteContent';
type Props = any;
export function EditableText({ field='', as: Tag='span', className='', children, ...props }: Props) {
  const { content, isEditMode, updateField, mounted } = useSiteContent() as any;
  const value = field ? (content?.[field] ?? children) : children;
  if (!mounted) return <Tag className={className} {...props}>{value}</Tag>;
  if (!isEditMode) return <Tag className={className} {...props}>{value}</Tag>;
  return <Tag className={`${className} outline outline-1 outline-orange-300 bg-orange-50/50 rounded px-1`} contentEditable suppressContentEditableWarning onBlur={(e:any)=> field && updateField(field, e.currentTarget.textContent)} {...props}>{value}</Tag>;
}
export const Editable = EditableText;
export const EditableTextComponent = EditableText;
export default EditableText;
