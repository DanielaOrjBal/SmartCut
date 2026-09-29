import { PublicPost } from '../../domain/entities/PublicPost';

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=10';

export async function getPublicPosts(): Promise<PublicPost[]> {
  const response = await fetch(POSTS_URL);
  if (!response.ok) {
    throw new Error('No fue posible consultar el servicio web.');
  }
  return response.json();
}
