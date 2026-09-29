import { useCallback, useEffect, useState } from 'react';
import { getPublicPosts } from '../../data/services/PublicPostsService';
import { PublicPost } from '../../domain/entities/PublicPost';

export function usePublicPostsViewModel() {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await getPublicPosts();
      setPosts(data);
    } catch {
      setErrorMessage(
        'No fue posible cargar las publicaciones. Revise Internet e inténtelo nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    isLoading,
    errorMessage,
    reload: loadPosts,
  };
}
