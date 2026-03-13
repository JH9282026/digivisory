import PageEditorClient from '../_components/page-editor-client';
export default function EditPagePage({ params }: { params: { id: string } }) { return <PageEditorClient pageId={params?.id} />; }
