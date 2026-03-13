import PostEditorClient from '../_components/post-editor-client';

export default function EditPostPage({ params }: { params: { id: string } }) {
  return <PostEditorClient postId={params?.id} />;
}
